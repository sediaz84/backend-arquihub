const mongoose = require("mongoose")
const mongooseDelete = require("mongoose-delete")

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    visibility: {
        type: String,
        enum: ["private", "public"],
        default: "public"
    },
    created_by: {
        type: mongoose.Types.ObjectId,
    },
    project_id:{
        type: mongoose.Types.ObjectId,
    },
    project_type: {
        type: String,
    },
    mts2: {
        type: Number
    },
    rooms: {
        type: Number
    },
    year: {
        type: Number
    },
    bathrooms: {
        type: Number
    },
    authors:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    additional_data: [{
        type: String
    }],
    rating: {
        type: Number
    }
}, {
    timestamps: true
})

PostSchema.statics.findAllData= function (){
    const joinReviews = this.aggregate([
        {
            $lookup:{
                from: "reviews",
                localField:"_id",
                foreignField:"postId",
                as:"reviews"
            }
        },
    ])
    return joinReviews 
};

PostSchema.plugin(mongooseDelete, {overrideMethods: "all"})

module.exports = mongoose.model("posts", PostSchema)