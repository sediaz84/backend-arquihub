const { postModel,reviewModel, usersModel} = require("../models")
const {verifyToken}= require("../middlewares/auth.jwt")
const emailer = require("../config/emailer")
const {commentedPost, posted, postUpdated} = require("../utils/templates/post")


const getPosts = async (req, res) => {
    try {
        const allPosts = await postModel.find({})
        res.send(allPosts)

    } catch (err) {
        res.status(400).send({err:err.message})
    }
}

const createPost = async (req, res) => {
    try {
        const { title,
            description,
            visibility,
            created_by,
            project_type,
            mts2,
            project_id,
            rooms,
            year,
            bathrooms,
            image,
            authors,
            additional_data,
            rating,
        } = req.body;

        if (!title || !description || !project_type) {
            return res.status(400).send("Missing required parameters")
        }  

        const newPost = {
            title,
            description,
            visibility,
            created_by,
            project_type,
            project_id,
            mts2,
            rooms,
            image,
            year,
            bathrooms,
            additional_data,
            rating,
        }

        const postCreator = await usersModel.findOne({"id": created_by})
        const creator = postCreator.email
        const postAuthors = await usersModel.find().where('_id').in(authors).exec();
        const authorsEmails = postAuthors.map((author)=> author.email)
        const emails = [creator, authorsEmails]

        // console.log(newPost)
        const createPost = await postModel.create(newPost)

        const {id} = createPost;
         authors.forEach(async (e) => {
            // console.log(e)
            await postModel.updateOne({_id:id},
              { $push: { authors: e.value } },
              { new: true, useFindAndModify: false }
            );
            await usersModel.updateOne({_id:e.value},
                { $push: { posts: id } },
                { new: true, useFindAndModify: false }
              );
          });
          
    console.log(emails.flat(1));

    const newPostF = await postModel.findById(id)
    emailer.sendMail (emails.flat(1), "Post Created", "<div><p>Post created</p></div")

          res.status(200).send(newPostF);
    } catch (err) {
        res.status(400).send({err:err.message})
    }
}

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            created_by,
            visibility,
            project_id,
            project_type,
            mts2,
            rooms,
            year,
            bathrooms,
            authors,
            additional_data,
            rating } = req.body;

        const updatePost = {
            title,
            description,
            project_id,
            project_type,
            mts2,
            rooms,
            year,
            bathrooms,
            additional_data,
            rating
        }

        const postCreator = await usersModel.findOne({"id": created_by})
        const creator = postCreator.email
        const postAuthors = await usersModel.find().where('_id').in(authors).exec();
        const authorsEmails = postAuthors.map((author)=> author.email)
        const emails = [creator, authorsEmails]

        await postModel.findOneAndUpdate(id, updatePost)
        emailer.sendMail (emails.flat(1), `${title} has been updated`, "<div><p>Post updated</p></div")


        res.send(updatePost)

    } catch (error) {
        res.status(400).send("Cant update this post")
    }
}

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await postModel.deleteOne({ _id: id })
        res.send("Post deleted")
    } catch (err) {
        res.status(400).send({err:err.message})
    }
}


const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const allPosts = await postModel.aggregate([
            {
              $lookup: {
                from: "projects",
                localField: "project_id",
                foreignField: "_id",
                as: "project",
              },
            },
            {
                $lookup: {
                  from: "users",
                  localField: "created_by",
                  foreignField: "_id",
                  as: "created_by_data",
                },
              },
          ]);
          const post = allPosts.find(e=>e._id==id); 
             const postReviews= await reviewModel.aggregate([{
                $lookup: {
                  from: "users",
                  localField: "user_id",
                  foreignField: "_id",
                  as: "user_data",
                },
              },]);
              const reviews = postReviews.filter(e=>e.post_id==id)
            const userPost = await postModel.populate(post, {path:"authors"}); 
/*            const getPost ={...userPost ,reviews:reviews }  */
            res.status(200).send(userPost);
    } catch (err) {
        res.status(400).send({err:err.message})
    }
}


module.exports = { getPosts, createPost, updatePost, deletePost, getPost } 
