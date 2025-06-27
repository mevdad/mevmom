import { getConsts } from '../u'
import mongoose from 'mongoose'

let mongo: any = {
    c: null,
    m: {}
}

// Connection
export const connect = async () => {
    if (!mongo.c) mongo.c = mongoose
    if (mongo.c.connection.readyState === 1) return
    const { MONGO_URL } = await getConsts()
    mongo.c.set('autoIndex', false)
    await mongo.c.connect(MONGO_URL || 'mongodb://localhost:27017/honey')
    console.log('MongoDB connected')

    const walletSchema = mongo.c.models.Wallet ? 
        mongo.c.models.Wallet.schema : 
        new mongo.c.Schema({
            address: { type: String, lowercase: true, unique: true },
            status: { type: String },
            privateKey: { type: String, lowercase: true, unique: true },
            deposit_amount: { type: String },
            groupId: { type: mongo.c.Schema.Types.ObjectId, ref: 'Group' }
        })

    const groupSchema = mongo.c.models.Group ?
        mongo.c.models.Group.schema :
        new mongo.c.Schema({
            name: { type: String, required: true, unique: true },
            description: { type: String },
            userId: { type: mongo.c.Schema.Types.ObjectId, ref: 'User', required: true },
            network: { type: String, enum: ['1', '56', '8453'], default: '8453', required: true },
            rpc_url: { type: String, default: '', required: true },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        })

    const txSchema = mongo.c.models.Transaction ? 
        mongo.c.models.Transaction.schema : 
        new mongo.c.Schema({
            transactionHash: { type: String, unique: true },
            data: { type: mongo.c.Schema.Types.Mixed }
        })

    const configSchema = mongo.c.models.Config ? 
        mongo.c.models.Config.schema : 
        new mongo.c.Schema({
            key: { type: String, unique: true },
            value: { type: mongo.c.Schema.Types.Mixed }
        })

    const taskSchema = mongo.c.models.Task ? 
        mongo.c.models.Task.schema : 
        new mongo.c.Schema({
            userId: { type: mongo.c.Schema.Types.ObjectId, ref: 'User', required: true },
            title: { type: String, required: true },
            description: { type: String },
            dueDate: { type: Date },
            token: { type: String, required: true },
            type: { type: String, enum: ['BUY', 'SELL', 'COUNTERTRADE'], required: true },
            walletsCount: { type: Number },
            customWallets: [{
                address: String,
                privateKey: String
            }],
            deposit_wallet_pk: { type: String, required: true  },
            slippage: { type: Number, default: 0.5 },
            distribution_percentage: { type: Number, default: 5 },
            sell_price: { type: Number, default: 0 },
            transactionTimeout: { type: Number, default: 2, required: true },
            status: { type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
            groupId: { type: mongo.c.Schema.Types.ObjectId, ref: 'Group' },
            createdAt: { type: Date, default: Date.now }
        })

    const logSchema = mongo.c.models.Log ? 
        mongo.c.models.Log.schema : 
        new mongo.c.Schema({
            time: { type: Date, default: Date.now },
            message: { type: String, required: false },
            data: { type: mongo.c.Schema.Types.Mixed, required: false },
            taskId: { type: mongo.c.Schema.Types.ObjectId, ref: 'Task', required: true },
            type: { type: String }
        })

    const userSchema = mongo.c.models.User ? 
        mongo.c.models.User.schema : 
        new mongo.c.Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        })

    const resetTokenSchema = mongo.c.models.ResetToken ?
        mongo.c.models.ResetToken.schema :
        new mongo.c.Schema({
            userId: { type: mongo.c.Schema.Types.ObjectId, ref: 'User', required: true },
            token: { type: String, required: true },
            expires: { type: Date, required: true },
            created_at: { type: Date, default: Date.now }
        })

    const providerSchema = mongo.c.models.Provider ? 
        mongo.c.models.Provider.schema : 
        new mongo.c.Schema({
            chain: { type: String, required: true, enum: ['8453', '1', '56'] },
            url: { type: String, required: true },
            userId: { type: mongo.c.Schema.Types.ObjectId, ref: 'User', required: true },
            name: { type: String, required: true }
        })

    // Models
    const Wallet = mongo.c.models.Wallet || mongo.c.model('Wallet', walletSchema)
    const Group = mongo.c.models.Group || mongo.c.model('Group', groupSchema)
    const Tx = mongo.c.models.Transaction || mongo.c.model('Transaction', txSchema)
    const Config = mongo.c.models.Config || mongo.c.model('Config', configSchema)
    const Task = mongo.c.models.Task || mongo.c.model('Task', taskSchema)
    const Log = mongo.c.models.Log || mongo.c.model('Log', logSchema)
    const User = mongo.c.models.User || mongo.c.model('User', userSchema)
    const ResetToken = mongo.c.models.ResetToken || mongo.c.model('ResetToken', resetTokenSchema)
    const Provider = mongo.c.models.Provider || mongo.c.model('Provider', providerSchema)

    mongo.m = {
        Wallet: Wallet,
        Group: Group,
        Tx: Tx,
        Confog: Config,
        Task: Task,
        Log: Log,
        User: User,
        ResetToken: ResetToken,
        Provider: Provider
    }
    console.log('MongoDB models initialized')
}

export const getMongo = async () => {
    if (!mongo.c) {
        await connect()
    }
    return mongo
}