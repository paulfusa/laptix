'use client'; 
import CountUp from 'react-countup'

const AnimatedCounter = ({ amount }: { amount: number }) => {
  return (
    <div >
        {/* For Other currencies well have to change decimal to comma */ }
        <CountUp 
            duration={1.75}
            decimals={2}
            decimal="." 
            prefix="$"
            end={amount}
        />
    </div>
  )
}

export default AnimatedCounter