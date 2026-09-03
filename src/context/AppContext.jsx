import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_VENDORS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES_ORDERS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_PRODUCT_STAGES,
  INITIAL_MEASUREMENTS,
  INITIAL_ORDER_BOOKINGS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_USERS,
} from '../data/seedData';
import { generateId, generateBarcode, playSound } from '../utils/formatters';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Authentication & Role-Based Access Control State
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('tc_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('tc_auth_user');
    // Default to the Store Owner (admin) or saved user session
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  // 1. Core State with LocalStorage Persistence
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('tc_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('tc_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('tc_purchase_orders');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('tc_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [salesOrders, setSalesOrders] = useState(() => {
    const saved = localStorage.getItem('tc_sales_orders');
    return saved ? JSON.parse(saved) : INITIAL_SALES_ORDERS;
  });

  const [ledgerEntries, setLedgerEntries] = useState(() => {
    const saved = localStorage.getItem('tc_ledger_entries');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER_ENTRIES;
  });

  const [productStages, setProductStages] = useState(() => {
    const saved = localStorage.getItem('tc_product_stages');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_STAGES;
  });

  const [measurements, setMeasurements] = useState(() => {
    const saved = localStorage.getItem('tc_measurements');
    return saved ? JSON.parse(saved) : INITIAL_MEASUREMENTS;
  });

  const [orderBookings, setOrderBookings] = useState(() => {
    const saved = localStorage.getItem('tc_order_bookings');
    return saved ? JSON.parse(saved) : INITIAL_ORDER_BOOKINGS;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('tc_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('tc_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // UI State
  const [activeTab, setActiveTab] = useState('pos'); // pos, purchase, profit, ledger, stages, measurement, booking, employee
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('tc_currency') || 'INR';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tc_theme') || 'dark';
  });
  const [toasts, setToasts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Apply theme to root document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tc_theme', theme);
  }, [theme]);

  // Sync currency preference
  useEffect(() => {
    localStorage.setItem('tc_currency', currency);
  }, [currency]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${nextTheme === 'light' ? 'Minimalist Light' : 'Midnight Dark'} Mode`, 'info');
      return nextTheme;
    });
  };

  // Authentication & Login Operations
  const login = (username, password) => {
    const user = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('tc_auth_user', JSON.stringify(user));
      playSound('success');
      showToast(`Welcome back, ${user.name}! [${user.role}]`, 'success');
      // Switch to first permitted tab
      if (user.permissions && user.permissions.length > 0) {
        setActiveTab(user.permissions[0]);
      }
      return { success: true, user };
    } else {
      playSound('error');
      showToast('Invalid username or password. Please try again.', 'danger');
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const quickLoginAs = (roleKey) => {
    const user = users.find((u) => u.roleKey === roleKey || u.username === roleKey);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('tc_auth_user', JSON.stringify(user));
      playSound('success');
      showToast(`Switched account: Logged in as ${user.name} (${user.role})`, 'success');
      if (user.permissions && user.permissions.length > 0) {
        setActiveTab(user.permissions[0]);
      }
      return user;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tc_auth_user');
    clearCart();
    playSound('beep');
    showToast('You have been logged out successfully.', 'info');
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('tc_products', JSON.stringify(products));
    localStorage.setItem('tc_vendors', JSON.stringify(vendors));
    localStorage.setItem('tc_purchase_orders', JSON.stringify(purchaseOrders));
    localStorage.setItem('tc_customers', JSON.stringify(customers));
    localStorage.setItem('tc_sales_orders', JSON.stringify(salesOrders));
    localStorage.setItem('tc_ledger_entries', JSON.stringify(ledgerEntries));
    localStorage.setItem('tc_product_stages', JSON.stringify(productStages));
    localStorage.setItem('tc_measurements', JSON.stringify(measurements));
    localStorage.setItem('tc_order_bookings', JSON.stringify(orderBookings));
    localStorage.setItem('tc_employees', JSON.stringify(employees));
    localStorage.setItem('tc_attendance', JSON.stringify(attendance));
    localStorage.setItem('tc_users', JSON.stringify(users));
    if (currentUser) {
      localStorage.setItem('tc_auth_user', JSON.stringify(currentUser));
    }
  }, [
    products,
    vendors,
    purchaseOrders,
    customers,
    salesOrders,
    ledgerEntries,
    productStages,
    measurements,
    orderBookings,
    employees,
    attendance,
    users,
    currentUser,
  ]);

  // Toast Notification Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ----------------------------------------------------
  // POS & Sales Order Actions
  // ----------------------------------------------------
  const addToCart = (product, selectedVariant = {}) => {
    playSound('beep');
    setCart((prevCart) => {
      const size = selectedVariant.size || product.sizes?.[0] || 'Standard';
      const color = selectedVariant.color || product.colors?.[0] || 'Default';
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          ...product,
          size,
          color,
          quantity: 1,
          discount: 0,
        },
      ];
    });
    showToast(`Added ${product.name} to POS cart`, 'info');
  };

  const updateCartItemQty = (index, delta) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const updateCartItemDiscount = (index, discount) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], discount: Number(discount) || 0 };
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscount(0);
    setSelectedCustomer(null);
  };

  // Complete POS Sale
  const completeSale = (saleData) => {
    const newInvoiceNo = `TC-INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: generateId('INV'),
      invoiceNo: newInvoiceNo,
      date: new Date().toLocaleString(),
      customerName: saleData.customerName || 'Walk-in Retail Customer',
      customerPhone: saleData.customerPhone || 'N/A',
      items: saleData.items,
      subtotal: saleData.subtotal,
      discountTotal: saleData.discountTotal,
      tax: saleData.tax,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod, // 'cash' | 'card' | 'upi' | 'split'
      paymentStatus: 'Paid',
      cashier: saleData.cashier || (currentUser ? `${currentUser.name} (${currentUser.role})` : 'David Miller (Sales Executive)'),
      profit: saleData.profit,
    };

    // 1. Add to sales orders
    setSalesOrders((prev) => [newOrder, ...prev]);

    // 2. Reduce Stock Quantity
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItems = saleData.items.filter((item) => item.id === prod.id);
        if (soldItems.length > 0) {
          const totalSoldQty = soldItems.reduce((acc, curr) => acc + curr.quantity, 0);
          return {
            ...prod,
            stock: Math.max(0, prod.stock - totalSoldQty),
          };
        }
        return prod;
      })
    );

    // 3. Add to Ledger
    const newLedger = {
      id: generateId('LED'),
      date: new Date().toISOString().split('T')[0],
      partyType: 'Customer',
      partyName: saleData.customerName || 'Walk-in Retail Customer',
      type: 'Debit',
      description: `Invoice #${newInvoiceNo} - POS Garments Sale`,
      amount: saleData.total,
      balance: 0.00,
      refNo: newInvoiceNo,
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    // 4. Update Sales Executive Monthly Sales (if David Miller or cashier)
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.role.includes('Sales')) {
          return {
            ...emp,
            salesAchievedThisMonth: (emp.salesAchievedThisMonth || 0) + saleData.total,
          };
        }
        return emp;
      })
    );

    clearCart();
    playSound('success');
    showToast(`Invoice #${newInvoiceNo} generated successfully!`, 'success');
    return newOrder;
  };

  // ----------------------------------------------------
  // Purchase Orders & Inward Stock Actions
  // ----------------------------------------------------
  const createPurchaseOrder = (poData) => {
    const newPO = {
      id: generateId('PO-2026'),
      vendorId: poData.vendorId,
      vendorName: poData.vendorName,
      orderDate: poData.orderDate || new Date().toISOString().split('T')[0],
      expectedDate: poData.expectedDate,
      status: 'Ordered',
      paymentStatus: poData.paidAmount >= poData.total ? 'Paid' : poData.paidAmount > 0 ? 'Partial Paid' : 'Pending',
      items: poData.items,
      subtotal: poData.subtotal,
      tax: poData.tax,
      total: poData.total,
      paidAmount: Number(poData.paidAmount) || 0,
      notes: poData.notes || 'Standard inward delivery purchase order',
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);

    // Update Vendor balance payable
    const unpaid = newPO.total - newPO.paidAmount;
    if (unpaid > 0) {
      setVendors((prev) =>
        prev.map((v) => (v.id === poData.vendorId ? { ...v, balancePayable: (v.balancePayable || 0) + unpaid } : v))
      );
    }

    // Ledger Entry for PO
    const newLedger = {
      id: generateId('LED'),
      date: newPO.orderDate,
      partyType: 'Supplier',
      partyName: poData.vendorName,
      type: 'Credit',
      description: `PO #${newPO.id} Inward Raw Material / Finished Goods`,
      amount: newPO.total,
      balance: unpaid,
      refNo: newPO.id,
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    showToast(`Purchase Order ${newPO.id} created!`, 'success');
    return newPO;
  };

  const receiveStockFromPO = (poId) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    // Update PO status
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'Completed', receivedDate: new Date().toISOString().split('T')[0] } : p))
    );

    // Auto increment stock for matching products if applicable
    setProducts((prev) =>
      prev.map((prod) => {
        const matchedItem = po.items.find(
          (item) => item.name.toLowerCase().includes(prod.name.toLowerCase()) || item.name.toLowerCase().includes(prod.category.toLowerCase())
        );
        if (matchedItem) {
          return { ...prod, stock: prod.stock + Number(matchedItem.qty || 0) };
        }
        return prod;
      })
    );

    showToast(`Stock received & inventory updated for PO #${poId}`, 'success');
  };

  // Add Vendor
  const addVendor = (vendorData) => {
    const customOrGeneratedId = vendorData.customId?.trim() || generateId('VEN');
    const newVendor = {
      id: customOrGeneratedId,
      ...vendorData,
      balancePayable: Number(vendorData.balancePayable) || 0,
      rating: Number(vendorData.rating) || 5.0,
    };
    setVendors((prev) => [...prev, newVendor]);
    showToast(`Vendor ${newVendor.name} [${newVendor.id}] added!`, 'success');
  };

  const deleteVendor = (vendorId) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    showToast('Vendor removed from registry', 'info');
  };

  // Add / Manage Customers & Clients
  const addCustomer = (custData) => {
    const customOrGeneratedId = custData.customId?.trim() || generateId('CUST');
    const newCustomer = {
      id: customOrGeneratedId,
      name: custData.name,
      phone: custData.phone || 'N/A',
      email: custData.email || '',
      city: custData.city || 'Local Store',
      type: custData.type || 'VIP Bespoke',
      loyaltyPoints: Number(custData.loyaltyPoints) || 0,
      balanceReceivable: Number(custData.balanceReceivable) || 0,
      totalSpent: 0,
    };
    setCustomers((prev) => [...prev, newCustomer]);
    showToast(`Client ${newCustomer.name} [${newCustomer.id}] registered!`, 'success');
    return newCustomer;
  };

  const deleteCustomer = (customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    showToast('Customer profile removed from registry', 'info');
  };

  const updateCustomer = (customerId, updatedData) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updatedData } : c))
    );
    showToast('Customer profile updated successfully!', 'success');
  };

  // ----------------------------------------------------
  // Product Stages Actions (Manufacturing Pipeline)
  // ----------------------------------------------------
  const createProductBatch = (batchData) => {
    const newBatch = {
      id: generateId('STG-BATCH'),
      batchNo: `LOT-2026-${Math.floor(100 + Math.random() * 900)}`,
      garmentType: batchData.garmentType,
      clientName: batchData.clientName || 'Showroom Lot',
      quantity: Number(batchData.quantity) || 1,
      currentStage: batchData.currentStage || 'Fabric Sourcing & Inward',
      assignedTo: batchData.assignedTo || 'Unassigned',
      startDate: batchData.startDate || new Date().toISOString().split('T')[0],
      targetDate: batchData.targetDate,
      progress: 15,
      fabricCode: batchData.fabricCode || 'FAB-GEN-01',
      qcStatus: 'In Progress',
      notes: batchData.notes || '',
      history: [
        {
          stage: batchData.currentStage || 'Fabric Sourcing & Inward',
          date: new Date().toISOString().split('T')[0],
          status: 'Active',
          by: batchData.assignedTo || 'Supervisor',
        },
      ],
    };

    setProductStages((prev) => [newBatch, ...prev]);
    showToast(`Manufacturing batch ${newBatch.batchNo} initiated!`, 'success');
  };

  const advanceProductStage = (batchId, nextStageName, progressVal) => {
    setProductStages((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId) {
          return {
            ...batch,
            currentStage: nextStageName,
            progress: progressVal,
            history: [
              ...batch.history,
              {
                stage: nextStageName,
                date: new Date().toISOString().split('T')[0],
                status: nextStageName === 'Showroom / Ready Stock' ? 'Completed' : 'Active',
                by: 'Department Master',
              },
            ],
          };
        }
        return batch;
      })
    );
    showToast(`Batch moved to ${nextStageName}!`, 'info');
  };

  const updateQCStatus = (batchId, status, remarks) => {
    setProductStages((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId) {
          return {
            ...batch,
            qcStatus: status,
            notes: remarks ? `${batch.notes} [QC: ${remarks}]` : batch.notes,
          };
        }
        return batch;
      })
    );
    showToast(`QC status updated: ${status}`, 'success');
  };

  // ----------------------------------------------------
  // Item Measurements & Tailoring Sizing
  // ----------------------------------------------------
  const saveMeasurementProfile = (profileData) => {
    const existingIndex = measurements.findIndex(
      (m) => m.customerId === profileData.customerId && m.garmentType === profileData.garmentType
    );

    if (existingIndex > -1) {
      setMeasurements((prev) => {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...profileData,
          updatedDate: new Date().toISOString().split('T')[0],
        };
        return updated;
      });
      showToast('Measurement profile updated!', 'success');
    } else {
      const newM = {
        id: generateId('MSR'),
        updatedDate: new Date().toISOString().split('T')[0],
        ...profileData,
      };
      setMeasurements((prev) => [newM, ...prev]);
      showToast('New measurement profile created!', 'success');
    }
  };

  // ----------------------------------------------------
  // Order Booking Actions (Advance Bespoke Orders)
  // ----------------------------------------------------
  const createOrderBooking = (bookingData) => {
    const newBooking = {
      id: generateId('BKG-2026'),
      bookingNo: `BK-${Math.floor(100 + Math.random() * 900)}`,
      customerId: bookingData.customerId,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      garmentType: bookingData.garmentType,
      fabricDetails: bookingData.fabricDetails,
      bookingDate: new Date().toISOString().split('T')[0],
      trialDate: bookingData.trialDate,
      deliveryDate: bookingData.deliveryDate,
      totalAmount: Number(bookingData.totalAmount) || 0,
      advancePaid: Number(bookingData.advancePaid) || 0,
      balanceDue: Math.max(0, (Number(bookingData.totalAmount) || 0) - (Number(bookingData.advancePaid) || 0)),
      status: 'Booked',
      assignedMaster: bookingData.assignedMaster || 'Senior Tailor',
      specialInstructions: bookingData.specialInstructions || '',
      measurementId: bookingData.measurementId || null,
    };

    setOrderBookings((prev) => [newBooking, ...prev]);

    // Add Advance to Ledger
    if (newBooking.advancePaid > 0) {
      const newLedger = {
        id: generateId('LED'),
        date: newBooking.bookingDate,
        partyType: 'Customer',
        partyName: newBooking.customerName,
        type: 'Credit',
        description: `Advance Deposit for Bespoke Booking #${newBooking.bookingNo}`,
        amount: newBooking.advancePaid,
        balance: newBooking.balanceDue,
        refNo: newBooking.bookingNo,
      };
      setLedgerEntries((prev) => [newLedger, ...prev]);
    }

    showToast(`Order Booking #${newBooking.bookingNo} created with advance!`, 'success');
    return newBooking;
  };

  const updateBookingStatus = (bookingId, newStatus, balancePaidNow = 0) => {
    setOrderBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const newBal = Math.max(0, b.balanceDue - balancePaidNow);
          return {
            ...b,
            status: newStatus,
            balanceDue: newBal,
            advancePaid: b.advancePaid + balancePaidNow,
          };
        }
        return b;
      })
    );
    showToast(`Booking status updated to ${newStatus}`, 'info');
  };

  // ----------------------------------------------------
  // Employee Attendance, Advances & Performance Payroll
  // ----------------------------------------------------
  const addEmployee = (empData) => {
    const newEmp = {
      id: generateId('EMP'),
      empId: `TC-EMP-0${employees.length + 1}`,
      joinDate: new Date().toISOString().split('T')[0],
      advanceLoanTotal: 0,
      advanceLoanDeductionPerMonth: 0,
      advanceLoanRemaining: 0,
      performanceScore: 4.8,
      piecesCompletedThisMonth: 0,
      salesAchievedThisMonth: 0,
      avatar: '👤',
      status: 'Active',
      ...empData,
      baseSalary: Number(empData.baseSalary) || 500,
      overtimeRatePerHour: Number(empData.overtimeRatePerHour) || 8.0,
    };
    setEmployees((prev) => [...prev, newEmp]);
    showToast(`Employee ${newEmp.name} added!`, 'success');
  };

  const updateEmployee = (empId, updatedFields) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId || emp.empId === empId) {
          return {
            ...emp,
            ...updatedFields,
          };
        }
        return emp;
      })
    );
    showToast('Employee profile updated successfully!', 'success');
  };

  const updateEmployeeSalary = (empId, salaryUpdates) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId || emp.empId === empId) {
          const updated = {
            ...emp,
            baseSalary: salaryUpdates.baseSalary !== undefined ? Number(salaryUpdates.baseSalary) : emp.baseSalary,
            pieceRateUnit: salaryUpdates.pieceRateUnit !== undefined ? Number(salaryUpdates.pieceRateUnit) : emp.pieceRateUnit,
            piecesCompletedThisMonth: salaryUpdates.piecesCompletedThisMonth !== undefined ? Number(salaryUpdates.piecesCompletedThisMonth) : emp.piecesCompletedThisMonth,
            salesAchievedThisMonth: salaryUpdates.salesAchievedThisMonth !== undefined ? Number(salaryUpdates.salesAchievedThisMonth) : emp.salesAchievedThisMonth,
            salesCommissionRate: salaryUpdates.salesCommissionRate !== undefined ? Number(salaryUpdates.salesCommissionRate) : emp.salesCommissionRate,
            overtimeRatePerHour: salaryUpdates.overtimeRatePerHour !== undefined ? Number(salaryUpdates.overtimeRatePerHour) : emp.overtimeRatePerHour,
            performanceScore: salaryUpdates.performanceScore !== undefined ? Number(salaryUpdates.performanceScore) : emp.performanceScore,
            advanceLoanDeductionPerMonth: salaryUpdates.advanceLoanDeductionPerMonth !== undefined ? Number(salaryUpdates.advanceLoanDeductionPerMonth) : emp.advanceLoanDeductionPerMonth,
            customBonus: salaryUpdates.customBonus !== undefined ? Number(salaryUpdates.customBonus) : (emp.customBonus || 0),
            customBonusNote: salaryUpdates.customBonusNote !== undefined ? salaryUpdates.customBonusNote : (emp.customBonusNote || ''),
            customDeduction: salaryUpdates.customDeduction !== undefined ? Number(salaryUpdates.customDeduction) : (emp.customDeduction || 0),
            customDeductionNote: salaryUpdates.customDeductionNote !== undefined ? salaryUpdates.customDeductionNote : (emp.customDeductionNote || ''),
            manualOtHours: salaryUpdates.manualOtHours !== undefined ? Number(salaryUpdates.manualOtHours) : emp.manualOtHours,
          };
          return updated;
        }
        return emp;
      })
    );
    showToast('Salary details updated successfully!', 'success');
  };

  const grantEmployeeAdvanceLoan = (empId, loanAmount, monthlyDeduction) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId || emp.empId === empId) {
          const updatedRemaining = (emp.advanceLoanRemaining || 0) + Number(loanAmount);
          const updatedTotal = (emp.advanceLoanTotal || 0) + Number(loanAmount);
          return {
            ...emp,
            advanceLoanTotal: updatedTotal,
            advanceLoanRemaining: updatedRemaining,
            advanceLoanDeductionPerMonth: Number(monthlyDeduction) || emp.advanceLoanDeductionPerMonth || 50,
          };
        }
        return emp;
      })
    );

    // Ledger entry for employee advance payout
    const empObj = employees.find((e) => e.id === empId || e.empId === empId);
    const newLedger = {
      id: generateId('LED'),
      date: new Date().toISOString().split('T')[0],
      partyType: 'Expense',
      partyName: `Staff Advance: ${empObj?.name || 'Employee'}`,
      type: 'Debit',
      description: `Advance Loan Disbursed ($${loanAmount})`,
      amount: Number(loanAmount),
      balance: Number(loanAmount),
      refNo: `ADV-${empId}`,
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    showToast(`Advance loan of $${loanAmount} approved and logged!`, 'success');
  };

  const logDailyAttendance = (attendanceRecord) => {
    const id = generateId('ATT');
    const newRecord = {
      id,
      date: new Date().toISOString().split('T')[0],
      ...attendanceRecord,
    };

    setAttendance((prev) => [newRecord, ...prev]);
    showToast(`Attendance marked for ${attendanceRecord.empName}`, 'success');
  };

  const updateAttendanceRecord = (attId, updatedFields) => {
    setAttendance((prev) =>
      prev.map((att) => (att.id === attId ? { ...att, ...updatedFields } : att))
    );
  };

  const addLedgerVoucher = (voucher) => {
    const newVoucher = {
      id: generateId('LED'),
      date: voucher.date || new Date().toISOString().split('T')[0],
      partyType: voucher.partyType, // 'Customer' | 'Supplier' | 'Expense'
      partyName: voucher.partyName,
      type: voucher.type, // 'Debit' | 'Credit'
      description: voucher.description,
      amount: Number(voucher.amount) || 0,
      balance: Number(voucher.amount) || 0,
      refNo: voucher.refNo || `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setLedgerEntries((prev) => [newVoucher, ...prev]);
    showToast(`Ledger voucher recorded successfully!`, 'success');
  };

  // Reset to default seed data
  const resetAllData = () => {
    if (window.confirm('Reset all business data to initial demo data?')) {
      localStorage.clear();
      setProducts(INITIAL_PRODUCTS);
      setVendors(INITIAL_VENDORS);
      setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      setCustomers(INITIAL_CUSTOMERS);
      setSalesOrders(INITIAL_SALES_ORDERS);
      setLedgerEntries(INITIAL_LEDGER_ENTRIES);
      setProductStages(INITIAL_PRODUCT_STAGES);
      setMeasurements(INITIAL_MEASUREMENTS);
      setOrderBookings(INITIAL_ORDER_BOOKINGS);
      setEmployees(INITIAL_EMPLOYEES);
      setAttendance(INITIAL_ATTENDANCE);
      clearCart();
      showToast('All ERP data has been restored to default demo state.', 'info');
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Data
        products,
        setProducts,
        vendors,
        setVendors,
        purchaseOrders,
        setPurchaseOrders,
        customers,
        setCustomers,
        addCustomer,
        deleteCustomer,
        updateCustomer,
        salesOrders,
        setSalesOrders,
        ledgerEntries,
        setLedgerEntries,
        productStages,
        setProductStages,
        measurements,
        setMeasurements,
        orderBookings,
        setOrderBookings,
        employees,
        setEmployees,
        attendance,
        setAttendance,

        // POS & Cart
        cart,
        addToCart,
        updateCartItemQty,
        updateCartItemDiscount,
        removeFromCart,
        clearCart,
        cartDiscount,
        setCartDiscount,
        selectedCustomer,
        setSelectedCustomer,
        completeSale,

        // Purchase
        createPurchaseOrder,
        receiveStockFromPO,
        addVendor,
        deleteVendor,

        // Stages
        createProductBatch,
        advanceProductStage,
        updateQCStatus,

        // Measurements & Bookings
        saveMeasurementProfile,
        createOrderBooking,
        updateBookingStatus,

        // Employee & Payroll
        addEmployee,
        updateEmployee,
        updateEmployeeSalary,
        grantEmployeeAdvanceLoan,
        logDailyAttendance,
        updateAttendanceRecord,
        addLedgerVoucher,

        // UI & Global
        activeTab,
        setActiveTab,
        isMobileNavOpen,
        setIsMobileNavOpen,
        currency,
        setCurrency,
        theme,
        toggleTheme,
        toasts,
        showToast,
        resetAllData,

        // Authentication & RBAC
        users,
        setUsers,
        currentUser,
        setCurrentUser,
        login,
        quickLoginAs,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
