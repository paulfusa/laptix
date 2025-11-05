import AnimatedCounter from './AnimatedCounter'
import DoughnutChart from './DoughnutChart'
import LiquidGlass from './LiquidGlassClient'

const TotalBalanceBox = ({
    accounts = [],
    totalBanks,
    totalCurrentBalance}:TotalBalanceBoxProps) => {
  return (
        <div className='total-balance'>
            <div className="total-balance-chart">
                <DoughnutChart accounts={accounts} />
            </div>

            <div className="flex flex-col gap-6">
                <h2 className="total-balance-banks">
                    Bank Accounts: {totalBanks}
                </h2>
                <div className="flex flex-col gap-6">
                    <p className="total-balance-label">
                        Total Current Balance
                    </p>
                    <div className="total-balance-amount flex-center gap-2">
                        <AnimatedCounter amount={totalCurrentBalance} />    
                    </div>
                </div>
            </div>
        </div>

  )
}

export default TotalBalanceBox