import { useDispatch } from "react-redux"
import { createPostRequest, deleteFileRequest, deletePostRequest, getFollowingUsersPostsRequest, getOnePostRequest, getPostsRequest, updatePostRequest } from "../services/posts.js"
import { PostContext } from "./Context.jsx"
import { editPost, getFollowingPosts, getStatePost, getStatePosts, newPost, removeFile, removePost } from "../redux/slices/postSlice.js"
import { useState } from "react"
import { getFollowing } from "../redux/slices/registerSlice.js"
import { createCommentRequest, deleteCommentRequest, getCommentRequest, getCommentsRequest, getRepliesRequest } from "../services/comments.js"
import { getStateComment, getStateComments, getStateReplies, removeComment } from "../redux/slices/commentSlice.js"


const PostContextProvider = ({ children }) => {
    
    const dispatch = useDispatch()

    const [loading, setLoading] = useState(true)

    const loadPosts = async (skip) => {
        try {
            setLoading(true)
            const res = await getPostsRequest(skip)

            if (!res.posts || res.posts.length === 0) {
                setLoading(false)
                return;

            } else if (res) {
                dispatch(getStatePosts(res.posts))
                console.log(res)

            } else {
                console.error('La respuesta es:', res)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const loadPost = async (postId) => {
        try {
            const res = await getOnePostRequest(postId)
            if (res) {
                dispatch(getStatePost(res))
            } else {
                console.log('La respuesta es: ', res)
            }
            setLoading(false)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    const loadFollowingPosts = async (skip) => {
        try {
            setLoading(true)
            const data = await getFollowingUsersPostsRequest(skip)
            console.log(data)

            if (!data) {
                setLoading(false)
                return;
            } else if (data) {
                dispatch(getFollowing(data.following || []))
                dispatch(getFollowingPosts(data.followingPosts))
            } else {
                console.log('La respuesta es: ', data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const addPost = async (post) => {
        try {
            setLoading(false)
            const res = await createPostRequest(post)
            if (res) {
                dispatch(newPost(res))
                console.log(res)
            } else {
                console.error('La respuesta es:', res);
            }

        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    const updatePost = async (id, values) => {
        try {
            const res = await updatePostRequest(id, values)
            if (res) {
                dispatch(editPost(res.data))
                console.log(res)
                setLoading(false)
            } else {
                console.error('La respuesta es:', res)
            }

        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    const deleteFile = async (id, filename) => {
        try {
            const res = await deleteFileRequest(id, filename)
            if (res.status === 204) {
                dispatch(removeFile({ id, filename }))
            } 

        } catch (error) {
            console.error(error)
        }
    }
    
    const deletePost = async (id) => {
        try {
            const res = await deletePostRequest(id)
            if (res.status === 204) {
                dispatch(removePost(id))
            }
        } catch (error) {
            console.error(error);
        }
    }

    const getComments = async (postId, skip) => {
        try {
            setLoading(true)
            const res = await getCommentsRequest(postId, skip)
            if (res) {
                dispatch(getStateComments(res.comments))
            } else {
                console.log('La respuesta es: ', res)
            }
        } catch (error) {
            console.error(error)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    const getComment = async (commentId) => {
        try {
            const res = await getCommentRequest(commentId)
            console.log(res)
            
            if (res) {
                dispatch(getStateComment(res))
            } else {
                console.log('La respuesta es: ', res)
            }
            setLoading(false)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    const createComment = async (postId, parentComment, comment) => {
        try {
            const res = await createCommentRequest(postId, parentComment, comment)
            if (res) {
                console.log('Valor de parentComment en context: ', parentComment)
                
                if (parentComment) {
                    await getReplies(parentComment)
                } else {
                    await getComments(postId)
                }
            } else {
                console.log('La respuesta es: ', res)
            }

        } catch (error) {
            console.error(error)
        }
    }

    const deleteComment = async (commentId) => {
        try {
            const res = await deleteCommentRequest(commentId)
            if (res.status === 204) {
                dispatch(removeComment(commentId))
            } else {
                console.warn('Ocurrio un error al borrar el comentario')
            }

        } catch (error) {
            console.error(error)
        }
    }

    const getReplies = async (parentCommentId, skip) => {
        try {
            setLoading(true)
            const res = await getRepliesRequest(parentCommentId, skip)
            if (res) {
                dispatch(getStateReplies({ replies: res.replies }))
            } else {
                console.log('La respuesta es: ', res)
            }
        } catch (error) {
            console.error(error)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <PostContext.Provider value={{
            loadPosts,
            loadPost,
            loadFollowingPosts,
            addPost,
            updatePost,
            deletePost,
            deleteFile,
            getComments,
            getComment,
            createComment,
            deleteComment,
            getReplies,
            loading,
            setLoading
        }}>
            {children}
        </PostContext.Provider>
    )
}

export default PostContextProvider
