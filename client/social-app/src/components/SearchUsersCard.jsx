import { useSelector } from 'react-redux'
import '../css/searchCard.css'
import { useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { API_BASE_URL } from '../config'
import { UserContext } from '../context/Context'
import SearchHistory from './SearchHistory'

const SearchUsersCard = ({ searchActive, searchValue, searchRef }) => {

    const { searchUsers, pushHistory } = useContext(UserContext)
    const users = useSelector(state => state.registerUser.users)
    const sessionUser = useSelector(state => state.registerUser.id)

    useEffect(() => {
        searchValue.length > 0 && searchUsers(searchValue)
    }, [searchValue])

    const results = users.filter(user => (
        user.name.includes(searchValue) || user.username.includes(searchValue)
    ))

    const handleUserClick = async (user) => {
        let type = 'general'
        try {
            await pushHistory(sessionUser, user._id, type)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div className={`container-search-card ${!searchActive ? 'search-disabled' : ''}`} ref={searchRef}>
                {searchActive && searchValue.length === 0 && <SearchHistory type='general' />}
                        {
                            searchValue.length > 0 && results.length === 0 ? (
                                <div className='search-empty'>
                                    <span>Pruebe con buscar por nombre de usuario, o incluso palabras clave.</span>
                                </div>
                            )
                                : searchValue.length > 0 && results.length > 0 && (
                                    users.map(user => (
                                        <div key={user._id} className='follows' onClick={() => handleUserClick(user)}>
                                            <article className='follower'>
                                                <Link className='user-img' to={`/profile/${user.username}`}>
                                                    {
                                                        user.profilePhoto && user.provider === 'local' ? 
                                                            <img src={`${API_BASE_URL}/image/${user.profilePhoto}?type=avatar`} alt='Foto de perfil' />

                                                            : user.profilePhoto && user.provider === 'google' ?
                                                                <img src={user.profilePhoto} alt="Foto de perfil" />

                                                            :
                                                            <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                                                    }
                                                </Link>
                                                <Link className='user' to={`/profile/${user.username}`}>
                                                    <div className='user-data'>
                                                        <div className='name-username'>
                                                            <span>{user.name}</span>
                                                            <span>@{user.username}</span>
                                                        </div>
                                                    </div>

                                                    <div className='user-biography'>
                                                        <p>{user.biography}</p>
                                                    </div>
                                                </Link>
                                            </article>
                                        </div>
                                    ))
                                )
                        }
                    </div>
        </>
    )
}

export default SearchUsersCard
