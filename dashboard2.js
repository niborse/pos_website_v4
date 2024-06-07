document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard loaded");

    // Retrieve sales and inventory data from localStorage
    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    const inventoryData = JSON.parse(localStorage.getItem('inventory')) || [];
    console.log("Retrieved sales data:", salesData);
    console.log("Retrieved inventory data:", inventoryData);

    // Check if sales data exists
    if (salesData.length === 0) {
        console.log("No sales data found");
        return;
    }

    // Extract unique years and months from salesData
    const uniqueYears = [...new Set(salesData.map(sale => new Date(sale.timestamp).getFullYear()))];
    const uniqueMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const uniqueQuarters = ["Q1", "Q2", "Q3", "Q4"];

    // Populate year slicer
    const yearSlicer = document.getElementById('yearSlicer');
    if (yearSlicer) {
        const allOption = document.createElement('option');
        allOption.value = "all";
        allOption.textContent = "All";
        yearSlicer.appendChild(allOption);

        uniqueYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSlicer.appendChild(option);
        });
    } else {
        console.error("Element with ID 'yearSlicer' not found");
    }

    // Populate quarter slicer
    const quarterSlicer = document.getElementById('quarterSlicer');
    if (quarterSlicer) {
        const allOption = document.createElement('option');
        allOption.value = "all";
        allOption.textContent = "All";
        quarterSlicer.appendChild(allOption);

        uniqueQuarters.forEach((quarter, index) => {
            const option = document.createElement('option');
            option.value = index + 1; // Quarter index (1-based)
            option.textContent = quarter;
            quarterSlicer.appendChild(option);
        });
    } else {
        console.error("Element with ID 'quarterSlicer' not found");
    }

    // Populate month slicer
    const monthSlicer = document.getElementById('monthSlicer');
    if (monthSlicer) {
        const allOption = document.createElement('option');
        allOption.value = "all";
        allOption.textContent = "All";
        monthSlicer.appendChild(allOption);

        uniqueMonths.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1; // Month index (1-based)
            option.textContent = month;
            monthSlicer.appendChild(option);
        });
    } else {
        console.error("Element with ID 'monthSlicer' not found");
    }

    // Filter data based on slicers
    function filterData() {
        const selectedYear = yearSlicer.value;
        const selectedQuarter = quarterSlicer.value;
        const selectedMonth = monthSlicer.value;

        let filteredSalesData = salesData;

        if (selectedYear !== "all") {
            filteredSalesData = filteredSalesData.filter(sale => new Date(sale.timestamp).getFullYear() == selectedYear);
        }

        if (selectedQuarter !== "all") {
            filteredSalesData = filteredSalesData.filter(sale => Math.floor((new Date(sale.timestamp).getMonth() + 3) / 3) == selectedQuarter);
        }

        if (selectedMonth !== "all") {
            filteredSalesData = filteredSalesData.filter(sale => new Date(sale.timestamp).getMonth() + 1 == selectedMonth);
        }

        updateCharts(filteredSalesData);
    }

    yearSlicer.addEventListener('change', filterData);
    quarterSlicer.addEventListener('change', filterData);
    monthSlicer.addEventListener('change', filterData);

    // Function to update charts with filtered data
    function updateCharts(filteredSalesData) {
        const timestamps = filteredSalesData.map(sale => sale.timestamp);
        const totalAmounts = filteredSalesData.map(sale => sale.totalAmount);
        const itemsSoldCounts = filteredSalesData.reduce((acc, sale) => {
            sale.itemsSold.forEach(item => {
                if (item.item) {
                    acc[item.item] = (acc[item.item] || 0) + item.quantity;
                }
            });
            return acc;
        }, {});
        const paymentMethods = filteredSalesData.reduce((acc, sale) => {
            acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalAmount;
            return acc;
        }, {});

        const revenuePerProduct = filteredSalesData.reduce((acc, sale) => {
            sale.itemsSold.forEach(item => {
                if (item.item) {
                    acc[item.item] = (acc[item.item] || 0) + (item.quantity * item.price);
                }
            });
            return acc;
        }, {});

        const getQuarter = (date) => Math.floor((date.getMonth() + 3) / 3);
        const itemsSoldPerQuarter = filteredSalesData.reduce((acc, sale) => {
            const quarter = getQuarter(new Date(sale.timestamp));
            acc[quarter] = (acc[quarter] || 0) + sale.itemsSold.reduce((sum, item) => sum + item.quantity, 0);
            return acc;
        }, {});

        const itemsSoldPerYear = filteredSalesData.reduce((acc, sale) => {
            const year = new Date(sale.timestamp).getFullYear();
            acc[year] = (acc[year] || 0) + sale.itemsSold.reduce((sum, item) => sum + item.quantity, 0);
            return acc;
        }, {});

        const itemsSoldPerMonth = filteredSalesData.reduce((acc, sale) => {
            const month = new Date(sale.timestamp).getMonth() + 1; // 1-based month index
            acc[month] = (acc[month] || 0) + sale.itemsSold.reduce((sum, item) => sum + item.quantity, 0);
            return acc;
        }, {});

        // Update chart data (you should initialize your charts before calling updateCharts)
        if (totalRevenueChart) {
            totalRevenueChart.data.labels = timestamps;
            totalRevenueChart.data.datasets[0].data = totalAmounts;
            totalRevenueChart.update();
        }

        if (mostSoldItemsChart) {
            mostSoldItemsChart.data.labels = Object.keys(itemsSoldCounts);
            mostSoldItemsChart.data.datasets[0].data = Object.values(itemsSoldCounts);
            mostSoldItemsChart.update();
        }

        if (totalItemsSoldQuarterChart) {
            totalItemsSoldQuarterChart.data.labels = Object.keys(itemsSoldPerQuarter).map(quarter => `Q${quarter}`);
            totalItemsSoldQuarterChart.data.datasets[0].data = Object.values(itemsSoldPerQuarter);
            totalItemsSoldQuarterChart.update();
        }

        if (totalItemsSoldYearChart) {
            totalItemsSoldYearChart.data.labels = Object.keys(itemsSoldPerYear);
            totalItemsSoldYearChart.data.datasets[0].data = Object.values(itemsSoldPerYear);
            totalItemsSoldYearChart.update();
        }

        if (totalItemsSoldMonthChart) {
            totalItemsSoldMonthChart.data.labels = Object.keys(itemsSoldPerMonth).map(monthIndex => uniqueMonths[monthIndex - 1]);
            totalItemsSoldMonthChart.data.datasets[0].data = Object.values(itemsSoldPerMonth);
            totalItemsSoldMonthChart.update();
        }

        if (revenueYearlyPerProductChart) {
            revenueYearlyPerProductChart.data.labels = Object.keys(revenuePerProduct);
            revenueYearlyPerProductChart.data.datasets[0].data = Object.values(revenuePerProduct);
            revenueYearlyPerProductChart.update();
        }

        if (paymentMethodRevenueChart) {
            paymentMethodRevenueChart.data.labels = Object.keys(paymentMethods);
            paymentMethodRevenueChart.data.datasets[0].data = Object.values(paymentMethods);
            paymentMethodRevenueChart.update();
        }

        // Update real-time sales data
        const totalSalesElement = document.getElementById('totalSales');
        const numTransactionsElement = document.getElementById('numTransactions');
        const avgTransactionValueElement = document.getElementById('avgTransactionValue');

        if (totalSalesElement) {
            totalSalesElement.textContent = filteredSalesData.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2);
        } else {
            console.error("Element with ID 'totalSales' not found");
        }

        if (numTransactionsElement) {
            numTransactionsElement.textContent = filteredSalesData.length;
        } else {
            console.error("Element with ID 'numTransactions' not found");
        }

        if (avgTransactionValueElement) {
            const totalSales = filteredSalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const avgTransactionValue = totalSales / filteredSalesData.length || 0;
            avgTransactionValueElement.textContent = avgTransactionValue.toFixed(2);
        } else {
            console.error("Element with ID 'avgTransactionValue' not found");
        }
    }

    // Initialize and update charts
    // Example of chart initialization
    const totalRevenueCtx = document.getElementById('totalRevenueChart').getContext('2d');
    const totalRevenueChart = new Chart(totalRevenueCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Revenue',
                data: [],
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

    // Initialize other charts similarly...
    const mostSoldItemsCtx = document.getElementById('mostSoldItemsChart').getContext('2d');
    const mostSoldItemsChart = new Chart(mostSoldItemsCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Most Sold Items',
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const totalItemsSoldQuarterCtx = document.getElementById('totalItemsSoldQuarterChart').getContext('2d');
    const totalItemsSoldQuarterChart = new Chart(totalItemsSoldQuarterCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Items Sold Per Quarter',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const totalItemsSoldYearCtx = document.getElementById('totalItemsSoldYearChart').getContext('2d');
    const totalItemsSoldYearChart = new Chart(totalItemsSoldYearCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Items Sold Per Year',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const totalItemsSoldMonthCtx = document.getElementById('totalItemsSoldMonthChart').getContext('2d');
    const totalItemsSoldMonthChart = new Chart(totalItemsSoldMonthCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Items Sold Per Month',
                data: [],
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const revenueYearlyPerProductCtx = document.getElementById('revenueYearlyPerProductChart').getContext('2d');
    const revenueYearlyPerProductChart = new Chart(revenueYearlyPerProductCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue Yearly Per Product',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const paymentMethodRevenueCtx = document.getElementById('paymentMethodRevenueChart').getContext('2d');
    const paymentMethodRevenueChart = new Chart(paymentMethodRevenueCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue by Payment Method',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
    //const revenuePerProduct = filteredSalesData.reduce((acc, sale) => {
       // sale.itemsSold.forEach(item => {
       //     if (item.item) {
        //        acc[item.item] = (acc[item.item] || 0) + (item.quantity * item.price);
       //     }
      //  });
     //   return acc;
   // }, {});

    
    const inventoryCounts = inventoryData.reduce((acc, item) => {
        acc[item.class] = (acc[item.class] || 0) + item.quantity;
        return acc;
    }, {});
    

    const inventoryLevelsCtx = document.getElementById('inventoryLevelsChart').getContext('2d');
        const inventoryLevelsChart = new Chart(inventoryLevelsCtx, {
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

        // Low Stock Alerts
        const lowStockThreshold = 5;
        const lowStockItems = inventoryData.filter(item => item.quantity <= lowStockThreshold);
        const lowStockAlertsContainer = document.getElementById('lowStockAlerts');
        lowStockItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.class}: ${item.quantity}`;
            lowStockAlertsContainer.appendChild(listItem);
        });

    

    // Listen for storage changes and update charts
    window.addEventListener('storage', (event) => {
        if (event.key === 'salesData' || event.key === 'inventory') {
            location.reload();
        }
    });
});
