import { AddAPhoto, Close } from "@mui/icons-material"
import DefaultProfilePhoto from '../img/profile-starter-bigphoto.png'
import { Link, useNavigate } from "react-router-dom"
import { useContext, useState } from "react"
import { UserContext } from "../context/Context.jsx"
import { useForm } from 'react-hook-form'
import { API_BASE_URL } from "../config.js"
import { uploadAvatarRequest, uploadBackgroundRequest } from "../services/users.js"
import '../css/editProfile.css'

const EditProfile = ({ onCancel, profileUser, open, onSendEditProfile, mode }) => {
    
    const { updateUser } = useContext(UserContext)
    const navigate = useNavigate()
    const { handleSubmit, register, formState: { errors } } = useForm()

    const [previewAvatar, setPreviewAvatar] = useState(false)
    const [previewBackground, setPreviewBackground] = useState(false)
    
    if (!profileUser) return <div>Lo sentimos, ha ocurrido un error, recargue la página por favor</div>

    
    const submit = handleSubmit(async (data) => {
        try {
            const userBackPhoto = document.querySelector('#background-img')
            if (userBackPhoto.files[0]) {
                const formData = new FormData()
                formData.append('background', userBackPhoto.files[0])
                formData.append('fileType', 'background')

                const backgroundData = await uploadBackgroundRequest(formData)
                updateUser(profileUser.username, backgroundData)
            }
            
            const userAvatar = document.querySelector('#profile-photo')
            if (userAvatar.files[0]) {
                const formData = new FormData()
                formData.append('avatar', userAvatar.files[0])
                formData.append('fileType', 'avatar')
                
                const avatarData = await uploadAvatarRequest(formData)
                updateUser(profileUser.username, avatarData)
            }
            
            updateUser(profileUser.username, { ...data })
            navigate(`/profile/${profileUser.username}`)
            onSendEditProfile()
        } catch (error) {
            console.error(error.message)
        }
    })

    
    const handleBackPhotoChange = e => {
        let file = e.target.files[0]
        setPreviewBackground(URL.createObjectURL(file))
    }

    const handleAvatarChange = e => {
        let file = e.target.files[0]
        setPreviewAvatar(URL.createObjectURL(file))
    }

    return (
        <div className={`container-edit-profile ${open ? 'open' : ''} ${!mode ? 'light-mode' : ''}`}>
            <header className="edit-profile-header">
                <div className="edit-profile-close">
                    <Link to={`/profile/${profileUser.username}`}><Close onClick={onCancel} /></Link>
                </div>
                <span>Editar perfil</span>
            </header>
            <div className="edit-profile-content">
                <div className="container-background-img">
                    <form className="background-img" onSubmit={submit}>
                        {
                            profileUser.backgroundPhoto && !previewBackground &&
                            <img className="background"
                                src={`${API_BASE_URL}/image/${profileUser.backgroundPhoto}?type=background`}
                                alt=""
                            />
                        }
                        {
                            previewBackground &&
                            <img className="background" src={previewBackground} alt="" />
                        }
                        <label htmlFor="background-img">
                            <AddAPhoto fontSize="small" />
                        </label>
                        <input type="file" {...register('background')}
                            name="background"
                            id="background-img"
                            accept="image/*" onChange={handleBackPhotoChange} />
                        <input type="hidden" {...register('fileType')} value='background' />
                        
                    </form>
                    <div className='profile-photo'>
                        {
                            profileUser.profilePhoto && profileUser.provider === 'local' && !previewAvatar ?
                                <img src={`${API_BASE_URL}/image/${profileUser.profilePhoto}?type=avatar`} alt="Foto de perfil" />

                                : profileUser.profilePhoto && profileUser.provider === 'google' && !previewAvatar ?
                                    <img src={profileUser.profilePhoto} alt="Foto de perfil" />

                                : !previewAvatar && <img src={DefaultProfilePhoto} alt="Foto de perfil" />
                        }
                        {
                            previewAvatar &&
                            <img src={previewAvatar} alt="" />
                        }
                        <label htmlFor="profile-photo">
                            <AddAPhoto fontSize="small" />
                        </label>
                        <input type="file" {...register('avatar')}
                            name="avatar"
                            id="profile-photo"
                            accept="image/*" onChange={handleAvatarChange} />
                        
                        <input type="hidden" {...register('fileType')} value='avatar' />
                    </div>
                </div>
            </div>
                <div className="edit-profile-inputs">
                    <form onSubmit={submit}>
                    <div className="inputs-text">
                        <div className="input-group">
                            <input type="text" {...register('name', { required: true })}
                                name="name"
                                id="name"
                                className='form-input'
                                placeholder=" "
                                defaultValue={profileUser.name}
                            />

                            <label htmlFor="name" className="input-label">Nombre</label>
                            {errors.name && <span className="input-error-span">Nombre es requerido</span>}
                        </div>
                        
                        <div className="input-group">
                            <input type="text" {...register('username', { required: true })}
                                name="username"
                                id="username"
                                className='form-input'
                                placeholder=" "
                                defaultValue={profileUser.username}
                            />

                            <label htmlFor="username" className="input-label">Nombre de usuario</label>
                            {errors.username && <span className="input-error-span">Nombre de usuario es requerido</span>}
                        </div>

                        <div className="input-group">
                            <textarea type="text" {...register('biography')}
                                name="biography"
                                id="biography"
                                className='form-input'
                                maxLength={200}
                                placeholder=" "
                                defaultValue={profileUser.biography}
                            ></textarea>

                            <label htmlFor="biography" className="input-label">Biografía</label>
                        </div>
                        <div className="input-group">
                            <input type="text" {...register('location')}
                                name="location"
                                id="location"
                                className='form-input'
                                maxLength={50}
                                placeholder=" "
                                defaultValue={profileUser.location}
                            />

                            <label htmlFor="location" className="input-label">Ubicación</label>
                        </div>
                        <div className="edit-birthdate">
                            <span>Fecha de nacimiento:</span>
                            <div>
                                <input type="date" {...register('birthDate', { required: true })}
                                    name="birthDate"
                                    id="birthDate"
                                    defaultValue={(profileUser.birthDate).split('T')[0]}
                                />
                                <span className="date">{(profileUser.birthDate).split('T')[0].split('-').reverse().join('-')}</span>
                            </div>
                            {errors.birthDate && <span className="input-error-span">Fecha de nacimiento es requerida</span>}
                        </div>
                        </div>
                    <button>Guardar</button>
                    </form>
                </div>
        </div>
    )
}

export default EditProfile
