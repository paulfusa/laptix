import React from 'react'
import Image from 'next/image'
import { logoutAccount } from '@/lib/actions/user.actions'
import { useRouter } from 'next/navigation'
const Footer = ({user, type="desktop"}: FooterProps) => {
  const router = useRouter();
  const handleLogOut = async() => {
    const loggedOut = await logoutAccount();
    if(loggedOut) router.push('/sign-in'); 
  }
  return (
    <footer className="footer">
      <p className='footer-text'>Logout</p>
      <div className="footer_image" onClick={handleLogOut}>
        <Image src="icons/logout.svg" fill alt="Logout"/>
      </div>
    </footer>
  )
}

export default Footer