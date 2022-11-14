import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { doValidateCPF } from '../common/validators';
import { environment } from '../common/environment';

export interface User extends mongoose.Document {
    name: string,
    email: string,
    password: string
}

export interface UserModel extends mongoose.Model<User> {
    doFindByEmail(email: string): Promise<User>;
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
        match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
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
});

userSchema.statics.doFindByEmail = function(email: string) {
    return this.findOne({email});
}

//#region == MIDDLEWARES CRIPTOGRAFIA DE SENHA==

const doHashPassword = (obj, next) => {
    bcrypt.hash(obj.password, environment.security.saltRounds)
    .then(hash => {
        obj.password = hash;
        next();
    })
    .catch(next);
}
//post
const doSaveMiddleware = function (next) {
    const user: User = this;

    if (!user.isModified('password')) {
        next();
    } else {
        doHashPassword(user, next);
    }
}
//put e patch
const doUpdateMiddleware = function (next) {
    if (!this.getUpdate().password) {
        next();
    } else {
        doHashPassword(this.getUpdate(), next);
    }
}
//middlewares
userSchema.pre('save', doSaveMiddleware);
userSchema.pre('findOneAndUpdate', doUpdateMiddleware);
userSchema.pre('update', doUpdateMiddleware);

//#endregion

//vai exportar o modelo usuário -> classe
export const User = mongoose.model<User, UserModel>('User', userSchema);