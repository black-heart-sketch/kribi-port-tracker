import asyncHandler from 'express-async-handler';
import Berthing from '../models/berthing.model.js';

/**
 * @desc    Get all cargo awaiting customs clearance
 * @route   GET /api/customs/clearance
 * @access  Private/Customs Broker, Admin, Port Authority
 */
export const getCargoForClearance = asyncHandler(async (req, res) => {
  // Find all berthings with cargo that needs customs clearance
  const berthings = await Berthing.find({
    'cargoDetails.customsStatus': { $nin: ['cleared', 'held'] },
    status: { $in: ['approved', 'in_progress'] }
  })
  .populate('ship', 'name imoNumber type')
  .populate('dock', 'name location')
  .populate('cargoDetails.cargoOwnerId', 'name email')
  .lean();

  // Flatten the cargo items with their berthing info
  console.log(berthings)
  const cargoList = [];
  berthings.forEach(berthing => {
    berthing.cargoDetails.forEach(cargoItem => {
      if (cargoItem.customsStatus !== 'cleared') {
        cargoList.push({
          ...cargoItem,
          berthing: {
            _id: berthing._id,
            arrivalDate: berthing.arrivalDate,
            departureDate: berthing.departureDate,
            status: berthing.status,
            ship: berthing.ship,
            dock: berthing.dock
          }
        });
      }
    });
  });

  res.status(200).json({
    success: true,
    count: cargoList.length,
    data: cargoList
  });
});

/**
 * @desc    Update customs status for a cargo item
 * @route   PUT /api/customs/clearance/:cargoId
 * @access  Private/Customs Broker, Admin, Port Authority
 */
export const updateCustomsStatus = asyncHandler(async (req, res) => {
  const { cargoId } = req.params;
  const { status, notes,userId } = req.body;

  console.log(req.body,cargoId)

  // Validate status
  const validStatuses = ['not_verified', 'in_progress', 'verified', 'cleared', 'held'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
  }

  // Find the cargo item in any berthing
  const berthing = await Berthing.findOne({ 'cargoDetails._id': cargoId });
  
  if (!berthing) {
    console.log('Cargo not found');
return res.status(404).json({
  success: false,
  message: 'Cargo not found'
});
  }
 

  // Find the cargo item
  const cargoItem = berthing.cargoDetails.id(cargoId);
  if (!cargoItem) {
    console.log('Cargo item not found');
return res.status(404).json({
  success: false,
  message: 'Cargo item not found'
});
  }

  // Update the cargo status
  cargoItem.customsStatus = status;
  cargoItem.customsNotes = notes || cargoItem.customsNotes;
  cargoItem.clearedBy = userId;
  cargoItem.clearedAt = new Date();

  // Add to audit trail
  cargoItem.auditTrail = cargoItem.auditTrail || [];
  cargoItem.auditTrail.push({
    action: `Customs status updated to ${status}`,
    user: userId,
    timestamp: new Date(),
    details: notes ? { notes } : {}
  });

  await berthing.save();

  // Populate the response
  const populatedBerthing = await Berthing.findById(berthing._id)
    .populate('ship', 'name imoNumber')
    .populate('dock', 'name location')
    .populate('cargoDetails.cargoOwnerId', 'name email');

  const updatedCargo = populatedBerthing.cargoDetails.id(cargoId);

  res.status(200).json({
    success: true,
    data: updatedCargo
  });
});

/**
 * @desc    Get customs clearance history for a cargo item
 * @route   GET /api/customs/clearance/:cargoId/history
 * @access  Private/Customs Broker, Admin, Port Authority
 */
export const getClearanceHistory = asyncHandler(async (req, res) => {
  const { cargoId } = req.params;

  const berthing = await Berthing.findOne({ 'cargo._id': cargoId })
    .select('cargo.$')
    .populate('cargo.auditTrail.user', 'name email');

  if (!berthing) {
    throw new NotFoundError('Cargo not found');
  }

  const cargoItem = berthing.cargo.id(cargoId);
  if (!cargoItem) {
    throw new NotFoundError('Cargo item not found');
  }

  res.status(200).json({
    success: true,
    data: cargoItem.auditTrail || []
  });
});
