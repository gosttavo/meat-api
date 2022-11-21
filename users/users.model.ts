import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { doValidateCPF } from '../common/validators';
import { environment } from '../common/environment';

export interface User extends mongoose.Document {
    name: string,
    email: string,
    password: string
    cpf: string,
    gender: string,
    profiles: string[],
    matches(password: string): boolean,
    hasAny(...profiles: string[]): boolean
}

export interface UserModel extends mongoose.Model<User> {
    doFindByEmail(email: string, projection?: string): Promise<User>;
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
    },
    profiles: {
        type: [String],
        required: false
    }
});

userSchema.statics.doFindByEmail = function (email: string, projection: string) {
    return this.findOne({ email }, projection);
}

//método p/ comparar as senhas
userSchema.methods.matches = function (password: string): boolean {
    //vai comparar a senha passada com a hash da senha do banco
    return bcrypt.compareSync(password, this.password);
}

//método que vai retonar true se o profile estiver na lista de profiles
userSchema.methods.hasAny = function (...profiles: string[]): boolean {
    //se o profile recebido faz parte do grupo de profiles dos usuários
    return profiles.some(profile => this.profiles.indexOf(profile) !== -1);
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