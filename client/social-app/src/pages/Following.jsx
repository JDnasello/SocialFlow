import { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../context/Context.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { API_BASE_URL } from '../config.js'
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { Link } from 'react-router-dom'
import '../css/follows.css'
import { Cancel, Check, Diversity3, Handshake, PersonOff, Search, Tune } from '@mui/icons-material'
import { instance } from '../services/axios.js'
import { getSearchFollowings } from '../redux/slices/followSlice.js'

const Following = ({ mode, username, setOpenFollows }) => {

    const { showFollowing, followUser, unfollow } = useContext(UserContext)
    const dispatch = useDispatch()
    const user = useSelector(state => state.registerUser)
    const following = useSelector(state => state.registerUser.following)
    const searchFollowings = useSelector(state => state.follows.searchFollowings)
    const [changeWord, setChangeWord] = useState(null)
    const [searchActive, setSearchActive] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [mutual, setMutual] = useState(() => {
        const savedPreference = localStorage.getItem('search-followings')
        return savedPreference ? savedPreference : 'all'
    })
    const [openOptions, setOpenOptions] = useState(false)

    useEffect(() => {
        const fetchFollowing = async () => {
            await showFollowing(username)
        }

        fetchFollowing()
    }, [username])

    useEffect(() => {
        const searchUsers = async () => {
            try {
                const response = await instance.get(`${API_BASE_URL}/follow/followings/search/${searchValue}?mutual=${mutual}`)
                console.log(response.data)
                if (response.data) {
                    dispatch(getSearchFollowings(response.data.users))
                }
            } catch (error) {
                console.error(error)
            }
        }
        searchValue.length > 0 && searchUsers()
    }, [mutual, dispatch, searchValue])

    useEffect(() => {
        localStorage.setItem('search-followings', mutual)
    }, [mutual])

    const handleUnfollow = (followingId) => {
        unfollow(followingId)
        showFollowing(username)
    }

    const handleInputChange = async (e) => {
        setSearchValue(e.target.value)
    }

    const clearSearchInput = () => {
        setSearchValue('')
    }
    
    return (
        <div className="container-follows">
            <div className={`container-search-input ${searchActive ? 'search-input-active' : ''}`}
                    onFocus={() => setSearchActive(true)}
                    onBlur={() => setSearchActive(false)}
                    >
                <label htmlFor='search'>
                    <Search fontSize='medium' style={{ fill: searchActive ? 'var(--color-preference)' : '#c5c5c533'}} />
                </label>
                <input type="search" name="search" id="search" placeholder='Buscar'
                    value={searchValue.trim()} autoComplete='off' autoCorrect='off'
                    onChange={handleInputChange} />
                {
                    searchValue && (
                        <div className='search-input-cancel-icon' onClick={clearSearchInput}>
                            <Cancel />
                        </div>
                    )
                }
            </div>

            <span className={`filter-search-options ${openOptions ? 'focus' : ''}`} onClick={() => setOpenOptions(!openOptions)}>
                Filtrar búsqueda por <Tune />
            </span>
            {
                openOptions && (
                    <div className='container-search-type'>
                        <div className='search-type' onClick={() => setMutual('true')}>
                            <div className='search-type-text'>
                                <Handshake />
                                <span>Amigos</span>
                            </div>
                        {mutual === 'true' && <Check className='selected-search-type' />}
                        </div>
                        <div className="search-type" onClick={() => setMutual('false')}>
                            <div className="search-type-text">
                                <PersonOff />
                                <span>No te siguen</span>
                            </div>
                            {mutual === 'false' && <Check className='selected-search-type' />}
                        </div>
                        <div className="search-type" onClick={() => setMutual('all')}>
                            <div className="search-type-text">
                                <Diversity3 />
                                <span>Todo</span>
                            </div>
                            {mutual === 'all' && <Check className='selected-search-type' />}
                        </div>
                    </div>
                )
            }
            {
                searchValue.length > 0 ? searchFollowings.map(follow => (
                    <div key={follow._id} className='follows'>
                        <article className='follower'>
                            <Link className='user-img' to={`/profile/${follow.username}`} onClick={() => setOpenFollows(false)}>
                                {
                                    follow.profilePhoto && follow.provider === 'local' ? 
                                        <img src={`${API_BASE_URL}/image/${follow.profilePhoto}?type=avatar`} alt="Foto de perfil" />
                                        
                                        : follow.profilePhoto && follow.provider === 'google' ? 
                                            <img src={follow.profilePhoto} alt="Foto de perfil" />
                                        
                                        : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                }
                            </Link>
                            <Link className='user' to={`/profile/${follow.username}`} onClick={() => setOpenFollows(false)}>
                                <div className='user-data'>
                                    <div className='name-username'>
                                        <span>{follow.name}</span>
                                        <span>@{follow.username}</span>
                                    </div>
                                </div>

                                <div className='user-biography'>
                                    <p>{follow.biography}</p>
                                </div>
                            </Link>
                            <div className='follow-following-btns'>
                                {
                                    user.username !== follow.username && (
                                        follow && user.userFollowing.includes(follow._id) ? (
                                            <div className='following-btn'>
                                                <button className={`${changeWord === follow._id ? 'stop-following' : ''}`}
                                                    onMouseEnter={() => setChangeWord(follow._id)}
                                                    onMouseLeave={() => setChangeWord(null)}
                                                    onClick={() => handleUnfollow(follow._id)}>
                                                        {changeWord === follow._id ? 'Dejar de seguir' : 'Siguiendo'}
                                                </button>
                                            </div>
                                            ) : (
                                            <div className='follow-btn'>
                                                <button onClick={() => followUser(follow._id)}>Seguir</button>
                                            </div>
                                        )
                                    )
                                }
                            </div>
                        </article>
                    </div>
                )) 
                : following && following.length > 0 ?
                    following.map(follow => (
                        follow.following && follow.following.username &&
                            <div className='follows' key={follow._id}>
                                <article className='follower'>
                                    
                                    <Link className='user-img' to={`/profile/${follow.following.username}`} onClick={() => setOpenFollows(false)}>
                                        {
                                            follow.following && follow.following.profilePhoto && follow.following.provider === 'local' ? 
                                                <img src={`${API_BASE_URL}/image/${follow.following.profilePhoto}?type=avatar`} alt="Foto de perfil" />
                                                
                                                : follow.following && follow.following.profilePhoto && follow.following.provider === 'google' ?
                                                    <img src={follow.following.profilePhoto} alt="Foto de perfil" />

                                                : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                        }
                                    </Link>
                                    
                                    <Link className='user' to={`/profile/${follow.following.username}`} onClick={() => setOpenFollows(false)}>
                                        <div className='user-data'>
                                            <div className='name-username'>
                                                <span>{follow.following && follow.following.name}</span>
                                                <span>@{follow.following && follow.following.username}</span>
                                            </div>
                                        </div>

                                        <div className='user-biography'>
                                            <p>{follow.following && follow.following.biography}</p>
                                        </div>
                                    </Link>
                                    <div className='follow-following-btns'>
                                            {
                                                user.username !== follow.following.username && (
                                                    follow.user && user.userFollowing.includes(follow.following._id) ? (
                                                        <div className='following-btn'>
                                                            <button className={`${changeWord === follow.following._id ? 'stop-following' : ''}`}
                                                                onMouseEnter={() => setChangeWord(follow.following._id)}
                                                                onMouseLeave={() => setChangeWord(null)}
                                                                onClick={() => handleUnfollow(follow.following._id)}>
                                                                {changeWord === follow.following._id ? 'Dejar de seguir' : 'Siguiendo'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className='follow-btn'>
                                                            <button onClick={() => followUser(follow.following._id)}>Seguir</button>
                                                        </div>
                                                    )
                                                )
                                            }
                                    </div>
                                </article>
                        </div>
                    ))
                    : <span>No sigues a nadie aún</span>
            }
        </div>
    )
}

export default Following
