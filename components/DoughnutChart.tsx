'use client'; 

import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import {Doughnut} from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({accounts}: DoughnutChartProps) => {
    const accountNames = accounts?.map((a) => a.name);
    const balances = accounts?.map((a) => a.currentBalance);
    const data = {
        datasets: [
            {
                label: 'Banks',
                data: balances,
                backgroundColor: [
                    'rgba(64, 76, 212, 0.6)',
                    'rgba(17, 67, 215, 0.6)',
                    'rgba(18, 8, 155, 0.6)'
                ],
            }
        ],
        labels:['Bank 1', 'Bank 2', 'Bank 3']
    }
    return <Doughnut 
    data={data}
    options={{
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
            }
        }
    }}
    />
}

export default DoughnutChart