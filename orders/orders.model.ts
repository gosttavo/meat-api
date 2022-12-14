import * as mongoose from 'mongoose';
import { Restaurant } from '../restaurants/restaurants.model';

export interface OrderItems extends mongoose.Document {
    quantity: number,
    menuId: mongoose.Types.ObjectId | Restaurant,
    valueItem: number,
    name: string,
}

export interface Order extends mongoose.Document {
    name: string,
    email: string,
    address: string,
    number: number,
    optionalAddress: string,
    paymentOption: string,
    orderItems: OrderItems[],
    delivery: number,
    totalOrder: number,
}

const orderItemsSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    valueItem: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})

const orderSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true,
    },
    optionalAddress: {
        type: String,
        required: false
    },
    orderItems: {
        type: [orderItemsSchema],
        required: true,
        default: []
    },
    paymentOption: {
        type: String,
        enum: ['MON', 'DEB', 'CRED', 'PIX'],
        required: true
    },
    delivery: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: true,
    },
    rating: {
        type: Number,
        required: false
    },
    totalOrder: {
        type: Number,
        required: true
    }
})

export const Order = mongoose.model<Order>('Order', orderSchema);