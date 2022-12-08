import * as mongoose from 'mongoose';

export interface MenuItem extends mongoose.Document {
    id: string,
    name: string,
    description: string,
    price: number,
    imagePath: string
}

export interface Restaurant extends mongoose.Document {
    name: string,
    category: string,
    deliveryEstimate: string,
    rating: number,
    imagePath: string,
    menu: MenuItem[],
    about?: string,
    hours?: string
}

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    }
});

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    deliveryEstimate: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: false,
    },
    imagePath: {
        type: String,
        required: true,
    },
    menu: {
        type: [menuSchema],
        required: false,
        select: false,
        default: []
    },
    about: {
        type: String,
        required: false
    },
    hours: {
        type: String,
        required: false
    }
});

//restaurantSchema.index({'$**': 'text'});

export const Restaurant = mongoose.model<Restaurant>('Restaurant', restaurantSchema);