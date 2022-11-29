import * as mongoose from 'mongoose';

export interface OrderItems extends mongoose.Document {
    quantity: number, 
    menuId: string, 
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
        type: String, 
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
    name: {
        type: String,
        required: true,
        maxlength: 80,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    },
    address: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true,
    },
    optionalAddress:{
        type: String,
        required: false
    },
    orderItems: {
        type: [orderItemsSchema],
        required: true,
        select: false,
        default: []
    },
    delivery: {
        type: String,
        required: false
    },
    totalOrder:{
        type: Number,
        required: true
    }
})

export const Order = mongoose.model<Order>('Order', orderSchema);