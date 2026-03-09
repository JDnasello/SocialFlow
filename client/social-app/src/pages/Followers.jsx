import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../context/Context.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { API_BASE_URL } from '../config.js'
import { Link } from 'react-router-dom'
import { Cancel, Check, Diversity3, Handshake, PersonOff, Search, Tune } from '@mui/icons-material'
import { instance } from '../services/axios.js'
import { getSearchFollowers } from '../redux/slices/followSlice.js'

const Followers = ({ mode, username, setOpenFollows }) => {

    const { showFollowers, followUser, unfollow } = useContext(UserContext)
    const dispatch = useDispatch()
    const user = useSelector(state => state.registerUser)
    const followers = useSelector(state => state.registerUser.followers)
    const searchFollowers = useSelector(state => state.follows.searchFollowers)
    const [searchActive, setSearchActive] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [mutual, setMutual] = useState('all')
    const [openOptions, setOpenOptions] = useState(false)
    const [changeWord, setChangeWord] = useState(null)
    
    useEffect(() => {
        const fetchFollowers = async () => {
            await showFollowers(username)
        }

        fetchFollowers()
    }, [username])

    useEffect(() => {
        const searchUsers = async () => {
            try {
                const response = await instance.get(`${API_BASE_URL}/follow/followers/search/${searchValue}?mutual=${mutual}`)
                console.log(response.data)
                if (response.data) { 
                    dispatch(getSearchFollowers(response.data.users))
                }
            } catch (error) {
                console.error(error)
            }
        }

        searchValue.length > 0 && searchUsers()
    }, [mutual, dispatch, searchValue])

    const handleFollow = async (followId) => {
        await followUser(followId)
    }

    const handleUnfollow = async (followingId) => {
        await unfollow(followingId)
        
    }

    const handleInputChange = async (e) => {
        setSearchValue(e.target.value)
    }

    const clearSearchInput = () => {
        setSearchValue('')
    }

    return (
        <>
            <div className="container-follows">
                <div className={`container-search-input ${searchActive ? 'search-input-active' : ''}`}
                    onClick={() => setSearchActive(true)}
                    onBlur={() => setSearchActive(false)}
                    >
                    <label htmlFor='search'>
                        <Search fontSize='medium' style={{ fill: searchActive ? 'var(--color-preference)' : '#c5c5c533' }} />
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
                {
                    searchValue.length >= 0 &&
                    <span className={`filter-search-options ${openOptions ? 'focus' : ''}`} onClick={() => setOpenOptions(!openOptions)}>
                        Filtrar búsqueda por <Tune />
                    </span>
                }
                    {openOptions && (
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
                                    <span>No seguidos</span>
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
                    )}
                {   
                    searchValue.length > 0 ?
                        searchFollowers.map(follower => (
                            <div key={follower._id} className='follows'>
                                <article className='follower'>
                                    <Link className='user-img' to={`/profile/${follower.username}`} onClick={() => setOpenFollows(false)}>
                                        {
                                            follower.profilePhoto && follower.provider === 'local' ? 
                                                <img src={`${API_BASE_URL}/image/${follower.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                
                                                : follower.profilePhoto && follower.provider === 'google' ?
                                                    <img src={follower.profilePhoto} alt="Foto de perfil" />

                                                : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                        }
                                    </Link>
                                    <Link className='user' to={`/profile/${follower.username}`} onClick={() => setOpenFollows(false)}>
                                        <div className='user-data'>
                                            <div className='name-username'>
                                                <span>{follower.name}</span>
                                                <span>@{follower.username}</span>
                                            </div>
                                        </div>

                                        <div className='user-biography'>
                                            <p>{follower.biography}</p>
                                        </div>
                                    </Link>
                                    {
                                        follower && user.username !== follower.username && (
                                            follower && !user.userFollowing.includes(follower._id) ? (
                                                <div className='follow-btn'>
                                                    <button onClick={() => handleFollow(follower._id)}>Seguir</button>
                                                </div>
                                                ) : (
                                                    <div className='following-btn'>
                                                        <button className={`${changeWord === follower._id ? 'stop-following' : ''}`}
                                                            onMouseEnter={() => setChangeWord(follower._id)}
                                                            onMouseLeave={() => setChangeWord(null)}
                                                            onClick={() => handleUnfollow(follower._id)}>
                                                                {changeWord === follower._id ? 'Dejar de seguir' : 'Siguiendo'}
                                                        </button>
                                                    </div>
                                                    )
                                                )
                                    }
                                </article>
                            </div>
                        ))
                    : searchValue.length === 0 && followers && followers.length > 0 ?
                        followers.map(follower => (
                            follower.user && follower.user.username &&
                            <div key={follower.user._id} className='follows'>
                                <article className='follower'>
                                    <Link className='user-img' to={`/profile/${follower.user.username}`} onClick={() => setOpenFollows(false)}>
                                        {
                                            follower.user.profilePhoto && follower.user.provider === 'local' ? 
                                                <img src={`${API_BASE_URL}/image/${follower.user.profilePhoto}?type=avatar`} alt='Foto de perfil' />
                                                
                                                    : follower.user.profilePhoto && follower.user.provider === 'google' ?
                                                        <img src={follower.user.profilePhoto} alt="Foto de perfil" />
                                                        
                                                    : <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                        }
                                    </Link>
                                    <Link className='user' to={`/profile/${follower.user.username}`} onClick={() => setOpenFollows(false)}>
                                        <div className='user-data'>
                                            <div className='name-username'>
                                                <span>{follower.user.name}</span>
                                                <span>@{follower.user.username}</span>
                                            </div>
                                        </div>

                                        <div className='user-biography'>
                                            <p>{follower.user.biography}</p>
                                        </div>
                                    </Link>
                                            {
                                                follower.user && user.username !== follower.user.username && (
                                                    follower.user && !user.userFollowing.includes(follower.user._id) ? (
                                                        <div className='follow-btn'>
                                                            <button onClick={() => handleFollow(follower.user._id)}>Seguir</button>
                                                        </div>
                                                    ) : (
                                                        <div className='following-btn'>
                                                            <button className={`${changeWord === follower.user._id ? 'stop-following' : ''}`}
                                                                onMouseEnter={() => setChangeWord(follower.user._id)}
                                                                onMouseLeave={() => setChangeWord(null)}
                                                                onClick={() => handleUnfollow(follower.user._id)}>
                                                                {changeWord === follower.user._id ? 'Dejar de seguir' : 'Siguiendo'}
                                                            </button>
                                                        </div>
                                                    )
                                                )
                                            }
                                </article>
                        </div>
                        ))
                        :
                        <span>No tienes seguidores</span>
                }
            </div>
        </>
    )
}

export default Followers
