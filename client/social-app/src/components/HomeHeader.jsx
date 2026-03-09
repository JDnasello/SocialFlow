import { ArrowBack, Cancel, Search } from '@mui/icons-material'
import '../css/home.css'
import { useEffect, useRef, useState } from 'react'
import HomeNavBar from './HomeNavBar.jsx'
import SearchUsersCard from './SearchUsersCard.jsx'

const HomeHeader = ({ isInHomePath, mode, searchActive, setSearchActive, navVisible }) => {

    const [searchValue, setSearchValue] = useState('')
    const searchRef = useRef(null)

    useEffect(() => {
        
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)

    }, [])

    const handleInputChange = (e) => {
        setSearchValue(e.target.value)
    }

    const clearSearchInput = () => {
        setSearchValue('')
    }

    const handleClickOutside = (e) => {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
            setSearchActive(false)
        }
    }

    return (
    <>
            <div className={`home-header ${navVisible ? 'header-visible' : 'header-hidden'}`}>
                <div className='home-search'>
                    {searchActive && <ArrowBack className='close-icon' onClick={() => setSearchActive(false)} />}
                    <div className={`container-search-input ${searchActive ? 'search-input-active' : ''}`}
                        onFocus={() => setSearchActive(true)}
                    >
                        <label htmlFor='search'>
                            <Search fontSize='medium' style={{ fill: searchActive ? 'var(--color-preference)' : '#c5c5c53f'}} />
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

                </div>
                <SearchUsersCard searchRef={searchRef} searchActive={searchActive} searchValue={searchValue} />
                <HomeNavBar isInHomePath={isInHomePath} />
        </div>
    </>    
    )
}

export default HomeHeader
