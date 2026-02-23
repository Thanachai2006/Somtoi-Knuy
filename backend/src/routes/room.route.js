const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { authenticateToken, authorizeRole } = require ('../Middleware/auth.middleware');

router.use(authenticateToken);

router.post('/'
    // #swagger.tags = ['Rooms']
    // #swagger.consumes = ['multipart/form-data']
    // #swagger.parameters['roomType'] = { in: 'formData', type: 'string' }
    // #swagger.parameters['price'] = { in: 'formData', type: 'string' }
    // #swagger.parameters['floor'] = { in: 'formData', type: 'string' }
    // #swagger.parameters['status'] = { in: 'formData', type: 'Boolean' }
    ,authorizeRole(['ADMIN']),
     roomController.createRoom);
router.get('/',
    // #swagger.tags = ['Rooms']
    // #swagger.summary = 'Get all rooms'
    roomController.getAllRooms);
router.put('/:id', 
    // #swagger.tags = ['Rooms']
    // #swagger.summary = 'Update a room by ID (Admin only)'
    roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;