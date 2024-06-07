document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard loaded");

    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    const inventoryData = JSON.parse(localStorage.getItem('inventory')) || [];
    console.log("Retrieved sales data:", salesData);
    console.log("Retrieved inventory data:", inventoryData);

    if (salesData.length === 0) {
        console.log("No sales data found");
        return;
    }

    // Extract data for various charts
    const timestamps = salesData.map(sale => sale.timestamp);
    const totalAmounts = salesData.map(sale => sale.totalAmount);
    const itemsSoldCounts = salesData.reduce((acc, sale) => {
        sale.itemsSold.forEach(item => {
            if (item.item) {
                acc[item.item] = (acc[item.item] || 0) + item.quantity;
            }
        });
        return acc;
    }, {});
    const paymentMethods = salesData.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalAmount;
        return acc;
    }, {});

    const revenuePerProduct = salesData.reduce((acc, sale) => {
        sale.itemsSold.forEach(item => {
            if (item.item) {
                acc[item.item] = (acc[item.item] || 0) + (item.quantity * item.price);
            }
        });
        return acc;
    }, {});

    const getQuarter = (date) => Math.floor((date.getMonth() + 3) / 3);
    const itemsSoldPerQuarter = salesData.reduce((acc, sale) => {
        const quarter = getQuarter(new Date(sale.timestamp));
        acc[quarter] = (acc[quarter] || 0) + sale.itemsSold.reduce((sum, item) => sum + item.quantity, 0);
        return acc;
    }, {});

    const itemsSoldPerYear = salesData.reduce((acc, sale) => {
        const year = new Date(sale.timestamp).getFullYear();
        acc[year] = (acc[year] || 0) + sale.itemsSold.reduce((sum, item) => sum + item.quantity, 0);
        return acc;
    }, {});

    const itemsSoldPerMonth = salesData.reduce((acc, sale) => {
        const month = new Date(sale.timestamp).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + sale.itemsSold.reduce((sum, item) => sum + item.quantity, 0);
        return acc;
    }, {});

    const inventoryCounts = inventoryData.reduce((acc, item) => {
        acc[item.class] = (acc[item.class] || 0) + item.quantity;
        return acc;
    }, {});

    const aboutToStockOutItems = inventoryData.filter(item => item.quantity <= 5);

    // Total Revenue Chart
    const totalRevenueCtx = document.getElementById('totalRevenueChart').getContext('2d');
    const totalRevenueChart = new Chart(totalRevenueCtx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Total Revenue',
                data: totalAmounts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d'
                        }
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Most Sold Items Chart
    const mostSoldItemsCtx = document.getElementById('mostSoldItemsChart').getContext('2d');
    const mostSoldItemsChart = new Chart(mostSoldItemsCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(itemsSoldCounts),
            datasets: [{
                label: 'Quantity Sold',
                data: Object.values(itemsSoldCounts),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Total Items Sold Per Quarter Chart
    const totalItemsSoldQuarterCtx = document.getElementById('totalItemsSoldQuarterChart').getContext('2d');
    const totalItemsSoldQuarterChart = new Chart(totalItemsSoldQuarterCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(itemsSoldPerQuarter),
            datasets: [{
                label: 'Total Items Sold',
                data: Object.values(itemsSoldPerQuarter),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Total Items Sold Per Year Chart
    const totalItemsSoldYearCtx = document.getElementById('totalItemsSoldYearChart').getContext('2d');
    const totalItemsSoldYearChart = new Chart(totalItemsSoldYearCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(itemsSoldPerYear),
            datasets: [{
                label: 'Total Items Sold',
                data: Object.values(itemsSoldPerYear),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Total Items Sold Per Month Chart
    const totalItemsSoldMonthCtx = document.getElementById('totalItemsSoldMonthChart').getContext('2d');
    const totalItemsSoldMonthChart = new Chart(totalItemsSoldMonthCtx, {
        type: 'line',
        data: {
            labels: Object.keys(itemsSoldPerMonth),
            datasets: [{
                label: 'Total Items Sold',
                data: Object.values(itemsSoldPerMonth),
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Revenue Yearly Per Product Chart
    const revenueYearlyPerProductCtx = document.getElementById('revenueYearlyPerProductChart').getContext('2d');
    const revenueYearlyPerProductChart = new Chart(revenueYearlyPerProductCtx, {
        type: 'line',
        data: {
            labels: Object.keys(revenuePerProduct),
            datasets: [{
                label: 'Revenue',
                data: Object.values(revenuePerProduct),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Payment Method Revenue Chart
    const paymentMethodRevenueCtx = document.getElementById('paymentMethodRevenueChart').getContext('2d');
    const paymentMethodRevenueChart = new Chart(paymentMethodRevenueCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(paymentMethods),
            datasets: [{
                label: 'Revenue by Payment Method',
                data: Object.values(paymentMethods),
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        }
    });

    // Inventory Status Chart
    const inventoryStatusCtx = document.getElementById('inventoryStatusChart').getContext('2d');
    const inventoryStatusChart = new Chart(inventoryStatusCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(inventoryCounts),
            datasets: [{
                label: 'Quantity in Inventory',
                data: Object.values(inventoryCounts),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Items About to Stock Out Chart
    const stockOutItemsCtx = document.getElementById('stockOutItemsChart').getContext('2d');
    const stockOutItemsChart = new Chart(stockOutItemsCtx, {
        type: 'bar',
        data: {
            labels: aboutToStockOutItems.map(item => item.class),
            datasets: [{
                label: 'Quantity',
                data: aboutToStockOutItems.map(item => item.quantity),
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});