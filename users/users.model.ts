import * as mongoose from 'mongoose';
import { doValidateCPF } from '../common/validators';

export interface User extends mongoose.Document {
    name: string,
    email: string,
    password: string
}

//metadados do documento
//atributos do usuário
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 80,
        minlength: 3
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match:  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    },
    password: {
        type: String,
        select: false,
        required: true
    },
    gender: {
        type: String,
        required: false,
        enum: ['Male', 'Female', 'Attack-Helicopter']
    },
    cpf: {
       type: String,
       required: false,
       validate: {
        validator: doValidateCPF,
        message: '{PATH}: Invalid CPF ({VALUE})'
       } 
    }
})

//vai exportar o modelo usuário -> classe
export const User = mongoose.model<User>('User', userSchema);