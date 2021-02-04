import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/layout';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts)
}

const simpleOption = {
    title: {
        text: 'My chart'
    },
    series: [{
        data: [1, 2, 3]
    }],
    yAxis: {
        title: {
            text: 'Number of Employees'
        }
    },
    xAxis: {
        accessibility: {
            rangeDescription: 'Range: 2010 to 2012'
        }
    },
    plotOptions: {
        series: {
            pointStart: 2010
        }
    },
};

const lineChartOption = {
    title: {
        text: 'Solar Employment Growth by Sector, 2010-2016'
    },
    subtitle: {
        text: 'Source: thesolarfoundation.com'
    },
    yAxis: {
        title: {
            text: 'Number of Employees'
        }
    },
    xAxis: {
        accessibility: {
            rangeDescription: 'Range: 2010 to 2017'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 2010
        }
    },
    series: [{
        type: 'line',
        name: 'Installation',
        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    }, {
        type: 'line',
        name: 'Manufacturing',
        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
    }, {
        type: 'line',
        name: 'Sales & Distribution',
        data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
    }, {
        type: 'line',
        name: 'Project Development',
        data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
    }, {
        type: 'line',
        name: 'Other',
        data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
    }],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }
};

const withDataLabels = {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Monthly Average Temperature'
    },
    subtitle: {
        text: 'Source: WorldClimate.com'
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
        title: {
            text: 'Temperature (°C)'
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{
        name: 'Tokyo',
        data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
    }, {
        name: 'London',
        data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
    }]
};

const chartOptions = {
    'simple option': simpleOption,
    'line chart': lineChartOption,
    'with data label': withDataLabels,
};
const chartOptName = Object.keys(chartOptions);

export default function Charts() {

    const [options, setOption] = useState(chartOptName[0]);

    return <Layout>
        <Head><title>'Highcharts demo'</title></Head>
        <div className='col-lg-3 col-md-3 col-sm-3 col-xs-9 sidebar'>
            <ul className="nav nav-sidebar">
                <li className="active">
                    <ul>
                        {
                            chartOptName.map((value, idx) => {
                                return <li key={idx}
                                    className={options == chartOptName[idx] ? 'active' : ''}
                                    onClick={() => {
                                        setOption(chartOptName[idx]);
                                    }}>
                                    <a>
                                        {value}
                                    </a>
                                </li>
                            })
                        }
                    </ul>
                </li>
            </ul>
        </div>
        <div id="container" className='col-lg-9 col-md-9 col-sm-9 col-xs-12 sidebar-eq demo'>
            {
                chartOptName.map((value, idx) => {
                    if ( options === chartOptName[idx]) {
                        return <HighchartsReact
                            key={idx}
                            highcharts={Highcharts}
                            options={chartOptions[options]}
                        />;
                    } else {
                        return null;
                    }
                })
            }
        </div>
    </Layout>;
}