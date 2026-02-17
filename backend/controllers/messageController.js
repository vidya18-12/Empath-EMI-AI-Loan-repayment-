import Message from '../models/Message.js';
import Borrower from '../models/Borrower.js';
import Manager from '../models/Manager.js';
import EMIRecommendation from '../models/EMIRecommendation.js';
import { analyzeSentiment } from '../services/aiService.js';
import twilioService from '../services/twilioService.js';
import { syncRiskLevelWithStress } from '../utils/riskSync.js';
import aiChatService from '../services/aiChatService.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
    try {
        const { recipientId, content } = req.body;
        const userRole = req.user.role;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message content is required'
            });
        }

        if (!recipientId) {
            return res.status(400).json({
                success: false,
                error: 'Recipient ID is required'
            });
        }

        // Determine if sender is borrower or manager
        const isBorrower = userRole === 'user';
        const isManager = userRole === 'manager' || userRole === 'admin';

        let sentimentData = { sentiment: 'Unknown', score: 0 };
        if (isBorrower) {
            sentimentData = analyzeSentiment(content);
        }

        // Create message with new schema format
        let messageData = {
            sentiment: sentimentData.sentiment,
            riskScore: sentimentData.score,
            isAutomated: false,
        };

        if (isBorrower) {
            // Borrower sending to manager
            messageData.borrowerId = req.user._id;
            messageData.managerId = recipientId;
            messageData.sender = 'borrower';
            messageData.text = content;
        } else if (isManager) {
            // Manager sending to borrower
            messageData.borrowerId = recipientId;
            messageData.managerId = req.user._id;
            messageData.sender = 'manager';
            messageData.text = content;
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid user role'
            });
        }

        const message = await Message.create(messageData);

        // Send real SMS if manager is sending to borrower
        if (isManager) {
            const borrower = await Borrower.findById(recipientId);
            if (borrower && borrower.phoneNumber) {
                await twilioService.sendSMS(borrower.phoneNumber, content);
            }
        }

        // Trigger AI Automated Reply if sender is a Borrower
        if (isBorrower) {
            const borrower = await Borrower.findById(req.user._id);
            let managerId = borrower.assignedManager || borrower.uploadedBy;

            // Fallback to any manager if none assigned (crucial for automated replies)
            if (!managerId) {
                const anyManager = await (await import('../models/Manager.js')).default.findOne({});
                if (anyManager) managerId = anyManager._id;
            }

            if (managerId) {
                const { generateAIReply } = await import('../services/aiService.js');

                // Send empathetic text reply
                const aiReplyText = generateAIReply(borrower.customerName, sentimentData.sentiment, content);

                // Perform comprehensive behavioral analysis using integrated algorithm
                const behavioralScoring = (await import('../services/behavioralScoring.js')).default;
                const comprehensiveAnalysis = await behavioralScoring.calculateComprehensiveScore({
                    message: content,
                    borrower: borrower,
                    responseTime: 0 // Can be calculated based on last message time
                });

                // Update borrower with enhanced behavioral analysis
                borrower.behavioralAnalysis = {
                    stressLevel: comprehensiveAnalysis.stressLevel,
                    primaryIssue: comprehensiveAnalysis.primaryIssue,
                    willingnessToPay: comprehensiveAnalysis.willingnessToPay,
                    lastAnalysisDate: new Date(),
                    detailedInsights: `Comprehensive analysis (Score: ${comprehensiveAnalysis.compositeScore}/100): ${comprehensiveAnalysis.primaryIssue} detected. Stress level: ${comprehensiveAnalysis.stressLevel}.`
                };

                // Sync riskLevel with stressLevel for consistency
                borrower.riskLevel = await syncRiskLevelWithStress(comprehensiveAnalysis.stressLevel, borrower);

                // 2. Proactive EMI Suggestion Logic - Follows the AI chat

                // Also use traditional risk level analysis as fallback
                const { analyzeRiskLevel } = await import('../services/aiService.js');
                const autoRiskLevel = await analyzeRiskLevel(content, sentimentData);
                if (autoRiskLevel !== 'PENDING' && comprehensiveAnalysis.compositeScore > 70) {
                    borrower.riskLevel = autoRiskLevel;
                }

                // Check if borrower explicitly asked for plans
                const explicitlyAskedForPlans = aiChatService.detectPlanRequest(content);

                // Trigger plans if distress is detected OR if explicitly asked
                // Lowered threshold: Include 'Low' if overdue > 7 days
                const overdueDays = borrower.overdueDays || borrower.daysPastDue || 0;
                const isOverdueEnough = overdueDays > 7;
                const isDistressed = ['Moderate', 'High', 'Critical'].includes(comprehensiveAnalysis.stressLevel) ||
                    (comprehensiveAnalysis.stressLevel === 'Low' && isOverdueEnough);

                const showsFinancialDistress = isDistressed || explicitlyAskedForPlans || sentimentData.score > 70;

                if (showsFinancialDistress) {
                    // Check if we already sent plans in the last 2 hours 
                    const recentPlanMsg = await Message.findOne({
                        borrowerId: borrower._id,
                        sender: 'manager',
                        isAutomated: true,
                        conversationState: 'plan_suggested',
                        createdAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }
                    });

                    if (!recentPlanMsg || explicitlyAskedForPlans) {
                        // Generate plans using the comprehensive stress level
                        const { planA, planB } = aiChatService.generateEMIPlans(borrower, comprehensiveAnalysis.stressLevel);

                        // Generate a comprehensive response WITH plans
                        const planResponseText = aiChatService.generateResponseWithPlans(
                            borrower,
                            comprehensiveAnalysis,
                            planA,
                            planB
                        );

                        // Create the message with plans offered in metadata
                        await Message.create({
                            borrowerId: borrower._id,
                            managerId: managerId,
                            sender: 'manager',
                            text: planResponseText,
                            isRead: false,
                            isAutomated: true,
                            conversationState: 'plan_suggested',
                            metadata: {
                                analysis: comprehensiveAnalysis,
                                plansOffered: { planA, planB },
                                originalAiReply: aiReplyText
                            }
                        });

                        // Create EMI recommendations ... (A and B)
                        await EMIRecommendation.create({
                            borrowerId: borrower._id,
                            managerId: managerId,
                            riskLevel: borrower.riskLevel,
                            suggestedEMI: planA.suggestedEMI,
                            extendedTenure: planA.extendedTenure,
                            gracePeriod: planA.gracePeriod,
                            status: 'Pending',
                            planType: 'A',
                            isAutomated: true
                        });

                        await EMIRecommendation.create({
                            borrowerId: borrower._id,
                            managerId: managerId,
                            riskLevel: borrower.riskLevel,
                            suggestedEMI: planB.suggestedEMI,
                            extendedTenure: planB.extendedTenure,
                            gracePeriod: planB.gracePeriod,
                            status: 'Pending',
                            planType: 'B',
                            isAutomated: true
                        });

                        borrower.emiPlanStatus = 'pending';
                    } else {
                        // If plans sent recently, send the empathetic text anyway
                        await Message.create({
                            borrowerId: borrower._id,
                            managerId: managerId,
                            sender: 'manager',
                            text: aiReplyText,
                            isAutomated: true,
                            conversationState: 'awaiting_response'
                        });
                    }
                } else {
                    // Send the simple empathy message
                    await Message.create({
                        borrowerId: borrower._id,
                        managerId: managerId,
                        sender: 'manager',
                        text: aiReplyText,
                        isAutomated: true,
                        conversationState: 'awaiting_response'
                    });
                }

                await borrower.save();
            }
        }

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get conversation between manager and borrower
// @route   GET /api/messages/:otherId
// @access  Private
export const getConversation = async (req, res, next) => {
    try {
        const { otherId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        let query = {};
        if (userRole === 'user') {
            // Borrower viewing conversation with a manager (otherId)
            query = {
                $or: [
                    { borrowerId: userId, managerId: otherId },
                    { senderId: userId, recipientId: otherId },
                    { senderId: otherId, recipientId: userId }
                ]
            };
        } else {
            // Manager/Admin viewing conversation with a borrower (otherId)
            query = {
                $or: [
                    { borrowerId: otherId, managerId: userId },
                    { senderId: userId, recipientId: otherId },
                    { senderId: otherId, recipientId: userId }
                ]
            };
        }

        const messages = await Message.find(query).sort({ createdAt: 1 });

        // Check if there are no messages and the user is a borrower
        // If so, trigger the initial AI outreach message automatically
        if (messages.length === 0 && userRole === 'user') {
            const borrower = await Borrower.findById(userId);
            if (borrower) {
                // Determine manager (Sender)
                let managerId = borrower.assignedManager || borrower.uploadedBy;

                // Fallback to any manager if none assigned (to ensure message is sent)
                if (!managerId) {
                    const anyManager = await Manager.findOne({});
                    if (anyManager) managerId = anyManager._id;
                }

                if (managerId) {
                    const aiChatService = (await import('../services/aiChatService.js')).default;
                    const initialText = aiChatService.generateInitialMessage(borrower);

                    const initialMsg = await Message.create({
                        borrowerId: userId,
                        managerId: managerId,
                        sender: 'manager',
                        text: initialText,
                        isRead: false,
                        isAutomated: true,
                        conversationState: 'initiated'
                    });

                    messages.push(initialMsg);
                }
            }
        }

        // Normalize messages to consistent format for frontend
        const normalizedMessages = messages.map(msg => {
            // If it's new format (has borrowerId/managerId and sender field)
            if (msg.borrowerId && msg.managerId && msg.sender) {
                return {
                    _id: msg._id,
                    senderModel: msg.sender === 'manager' ? 'Manager' : 'Borrower',
                    senderId: msg.sender === 'manager' ? msg.managerId : msg.borrowerId,
                    recipientId: msg.sender === 'manager' ? msg.borrowerId : msg.managerId,
                    content: msg.text || msg.content, // Handle both 'text' and 'content' fields
                    sentiment: msg.sentiment,
                    riskScore: msg.riskScore,
                    createdAt: msg.createdAt,
                    isAutomated: msg.isAutomated || false,
                };
            }
            // Old format - return as is
            return msg;
        });

        res.status(200).json({
            success: true,
            data: normalizedMessages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all chat partners (for manager view)
// @route   GET /api/messages/partners
// @access  Private (Manager only)
export const getChatPartners = async (req, res, next) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Find all unique borrowers this manager has messaged or received from
        const partners = await Message.distinct('recipientId', { senderId: req.user._id });
        const fromPartners = await Message.distinct('senderId', { recipientId: req.user._id });

        const allPartnerIds = [...new Set([...partners, ...fromPartners])];
        const borrowerPartners = await Borrower.find({ _id: { $in: allPartnerIds } }).select('customerName loanId email');

        res.status(200).json({
            success: true,
            data: borrowerPartners,
        });
    } catch (error) {
        next(error);
    }
};
