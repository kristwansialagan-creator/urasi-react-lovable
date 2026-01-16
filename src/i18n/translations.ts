export type Language = 'id' | 'en'

export interface TranslationKeys {
    // Common
    common: {
        save: string
        cancel: string
        delete: string
        edit: string
        add: string
        search: string
        filter: string
        export: string
        import: string
        loading: string
        noData: string
        confirm: string
        back: string
        next: string
        previous: string
        close: string
        submit: string
        reset: string
        clear: string
        all: string
        none: string
        yes: string
        no: string
        ok: string
        error: string
        success: string
        warning: string
        info: string
        actions: string
        status: string
        date: string
        time: string
        amount: string
        total: string
        subtotal: string
        discount: string
        tax: string
        quantity: string
        price: string
        name: string
        description: string
        type: string
        category: string
        active: string
        inactive: string
        enabled: string
        disabled: string
        required: string
        optional: string
        from: string
        to: string
        today: string
        yesterday: string
        thisWeek: string
        lastWeek: string
        thisMonth: string
        lastMonth: string
        thisYear: string
        lastYear: string
    }
    
    // Auth
    auth: {
        login: string
        logout: string
        register: string
        forgotPassword: string
        resetPassword: string
        email: string
        password: string
        confirmPassword: string
        rememberMe: string
        signIn: string
        signUp: string
        signOut: string
        welcome: string
        welcomeBack: string
        createAccount: string
        alreadyHaveAccount: string
        dontHaveAccount: string
        enterEmail: string
        enterPassword: string
        invalidCredentials: string
        emailNotConfirmed: string
        tooManyRequests: string
        accountNotFound: string
        connectionError: string
        loginFailed: string
        systemError: string
        tryAgain: string
        checkEmailPassword: string
        checkSpamFolder: string
        waitMinutes: string
        checkEmailOrRegister: string
        checkConnection: string
        reloadAndTry: string
        contactAdmin: string
    }
    
    // Navigation
    nav: {
        dashboard: string
        pos: string
        products: string
        allProducts: string
        addProduct: string
        categories: string
        stockAdjustment: string
        orders: string
        allOrders: string
        instalments: string
        refunds: string
        customers: string
        allCustomers: string
        customerGroups: string
        procurements: string
        allProcurements: string
        providers: string
        registers: string
        transactions: string
        reports: string
        sales: string
        inventory: string
        cashFlow: string
        profit: string
        paymentTypes: string
        lowStock: string
        bestProducts: string
        yearly: string
        coupons: string
        rewards: string
        mediaLibrary: string
        tools: string
        dataManagement: string
        bulkEditor: string
        settings: string
    }
    
    // Dashboard
    dashboard: {
        title: string
        welcomeMessage: string
        todayTransactions: string
        weeklySales: string
        ordersSummary: string
        salesLast7Days: string
        topCustomers: string
        quickActions: string
        otherMenus: string
        openPOS: string
        addProduct: string
        customers: string
        orders: string
        reports: string
        settings: string
        products: string
        procurement: string
        register: string
        coupons: string
        manageInventory: string
        managePurchases: string
        manageCashier: string
        manageDiscounts: string
        startNewTransaction: string
        registerNewProduct: string
        manageCustomerData: string
        viewAllOrders: string
        salesAnalysis: string
        systemConfiguration: string
        fromYesterday: string
        fromLastWeek: string
        totalOrders: string
        paid: string
        partial: string
        unpaid: string
        void: string
        noCustomerData: string
    }
    
    // POS
    pos: {
        title: string
        searchProducts: string
        cart: string
        emptyCart: string
        addItemsToCart: string
        customer: string
        selectCustomer: string
        walkInCustomer: string
        subtotal: string
        discount: string
        tax: string
        total: string
        pay: string
        hold: string
        clear: string
        quantity: string
        unitPrice: string
        totalPrice: string
        removeItem: string
        applyDiscount: string
        applyCoupon: string
        payment: string
        cash: string
        card: string
        transfer: string
        amountTendered: string
        change: string
        completePayment: string
        printReceipt: string
        newSale: string
        heldOrders: string
        noHeldOrders: string
    }
    
    // Products
    products: {
        title: string
        allProducts: string
        addProduct: string
        editProduct: string
        deleteProduct: string
        productName: string
        sku: string
        barcode: string
        category: string
        unitPrice: string
        costPrice: string
        salePrice: string
        wholesalePrice: string
        stockQuantity: string
        lowStockAlert: string
        taxGroup: string
        unit: string
        status: string
        available: string
        unavailable: string
        outOfStock: string
        lowStock: string
        inStock: string
        searchProducts: string
        filterByCategory: string
        filterByStatus: string
        noProducts: string
        productCreated: string
        productUpdated: string
        productDeleted: string
        confirmDelete: string
        stockManagement: string
        enableStockTracking: string
        expirationTracking: string
        enableExpiration: string
    }
    
    // Orders
    orders: {
        title: string
        allOrders: string
        orderDetails: string
        orderCode: string
        orderDate: string
        customer: string
        paymentStatus: string
        deliveryStatus: string
        processStatus: string
        total: string
        paid: string
        unpaid: string
        partiallyPaid: string
        voided: string
        pending: string
        processing: string
        completed: string
        cancelled: string
        delivered: string
        shipped: string
        items: string
        viewOrder: string
        printInvoice: string
        addPayment: string
        refundOrder: string
        voidOrder: string
        noOrders: string
        searchOrders: string
        filterByStatus: string
        filterByDate: string
    }
    
    // Customers
    customers: {
        title: string
        allCustomers: string
        addCustomer: string
        editCustomer: string
        deleteCustomer: string
        firstName: string
        lastName: string
        email: string
        phone: string
        group: string
        address: string
        city: string
        country: string
        pobox: string
        birthdate: string
        gender: string
        male: string
        female: string
        other: string
        accountBalance: string
        owedAmount: string
        creditLimit: string
        totalPurchases: string
        rewardPoints: string
        customerGroups: string
        addGroup: string
        editGroup: string
        groupName: string
        groupDescription: string
        noCustomers: string
        customerCreated: string
        customerUpdated: string
        customerDeleted: string
        confirmDelete: string
    }
    
    // Reports
    reports: {
        title: string
        salesReport: string
        inventoryReport: string
        customerReport: string
        cashFlowReport: string
        profitReport: string
        paymentTypesReport: string
        lowStockReport: string
        bestProductsReport: string
        yearlyReport: string
        dateRange: string
        exportPDF: string
        exportExcel: string
        totalSales: string
        totalOrders: string
        averageOrder: string
        topSellingProducts: string
        revenueByCategory: string
        salesTrend: string
    }
    
    // Settings
    settings: {
        title: string
        general: string
        invoice: string
        pos: string
        orders: string
        customers: string
        accounting: string
        taxes: string
        units: string
        roles: string
        users: string
        modules: string
        receiptTemplate: string
        labelTemplates: string
        systemInfo: string
        systemReset: string
        storeName: string
        storeAddress: string
        storePhone: string
        storeEmail: string
        currency: string
        timezone: string
        dateFormat: string
        language: string
        theme: string
        light: string
        dark: string
        system: string
    }
}

const en: TranslationKeys = {
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        loading: 'Loading...',
        noData: 'No data available',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        close: 'Close',
        submit: 'Submit',
        reset: 'Reset',
        clear: 'Clear',
        all: 'All',
        none: 'None',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
        actions: 'Actions',
        status: 'Status',
        date: 'Date',
        time: 'Time',
        amount: 'Amount',
        total: 'Total',
        subtotal: 'Subtotal',
        discount: 'Discount',
        tax: 'Tax',
        quantity: 'Quantity',
        price: 'Price',
        name: 'Name',
        description: 'Description',
        type: 'Type',
        category: 'Category',
        active: 'Active',
        inactive: 'Inactive',
        enabled: 'Enabled',
        disabled: 'Disabled',
        required: 'Required',
        optional: 'Optional',
        from: 'From',
        to: 'To',
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This Week',
        lastWeek: 'Last Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        thisYear: 'This Year',
        lastYear: 'Last Year',
    },
    auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        forgotPassword: 'Forgot Password',
        resetPassword: 'Reset Password',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        rememberMe: 'Remember Me',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        welcome: 'Welcome',
        welcomeBack: 'Welcome Back',
        createAccount: 'Create Account',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: "Don't have an account?",
        enterEmail: 'Enter your email',
        enterPassword: 'Enter your password',
        invalidCredentials: 'Invalid Credentials',
        emailNotConfirmed: 'Email Not Confirmed',
        tooManyRequests: 'Too Many Requests',
        accountNotFound: 'Account Not Found',
        connectionError: 'Connection Error',
        loginFailed: 'Login Failed',
        systemError: 'System Error',
        tryAgain: 'Try Again',
        checkEmailPassword: 'The email or password you entered is incorrect. Please check and try again.',
        checkSpamFolder: 'Check your spam folder if you cannot find the confirmation email.',
        waitMinutes: 'Wait 5-10 minutes before trying again.',
        checkEmailOrRegister: 'Check your email or create a new account.',
        checkConnection: 'Make sure you are connected to the internet and try again.',
        reloadAndTry: 'Please reload the page and try again.',
        contactAdmin: 'Please try again or contact the administrator.',
    },
    nav: {
        dashboard: 'Dashboard',
        pos: 'POS',
        products: 'Products',
        allProducts: 'All Products',
        addProduct: 'Add Product',
        categories: 'Categories',
        stockAdjustment: 'Stock Adjustment',
        orders: 'Orders',
        allOrders: 'All Orders',
        instalments: 'Instalments',
        refunds: 'Refunds',
        customers: 'Customers',
        allCustomers: 'All Customers',
        customerGroups: 'Customer Groups',
        procurements: 'Procurements',
        allProcurements: 'All Procurements',
        providers: 'Providers',
        registers: 'Registers',
        transactions: 'Transactions',
        reports: 'Reports',
        sales: 'Sales',
        inventory: 'Inventory',
        cashFlow: 'Cash Flow',
        profit: 'Profit',
        paymentTypes: 'Payment Types',
        lowStock: 'Low Stock',
        bestProducts: 'Best Products',
        yearly: 'Yearly',
        coupons: 'Coupons',
        rewards: 'Rewards',
        mediaLibrary: 'Media Library',
        tools: 'Tools',
        dataManagement: 'Data Management',
        bulkEditor: 'Bulk Editor',
        settings: 'Settings',
    },
    dashboard: {
        title: 'Dashboard',
        welcomeMessage: 'Welcome back',
        todayTransactions: "Today's Transactions",
        weeklySales: 'Weekly Sales',
        ordersSummary: 'Orders Summary',
        salesLast7Days: 'Sales Last 7 Days',
        topCustomers: 'Top Customers',
        quickActions: 'Quick Actions',
        otherMenus: 'Other Menus',
        openPOS: 'Open POS',
        addProduct: 'Add Product',
        customers: 'Customers',
        orders: 'Orders',
        reports: 'Reports',
        settings: 'Settings',
        products: 'Products',
        procurement: 'Procurement',
        register: 'Register',
        coupons: 'Coupons',
        manageInventory: 'Manage inventory',
        managePurchases: 'Manage purchases',
        manageCashier: 'Manage cashier',
        manageDiscounts: 'Manage discounts',
        startNewTransaction: 'Start new transaction',
        registerNewProduct: 'Register new product',
        manageCustomerData: 'Manage customer data',
        viewAllOrders: 'View all orders',
        salesAnalysis: 'Sales analysis',
        systemConfiguration: 'System configuration',
        fromYesterday: 'from yesterday',
        fromLastWeek: 'from last week',
        totalOrders: 'Total Orders',
        paid: 'Paid',
        partial: 'Partial',
        unpaid: 'Unpaid',
        void: 'Void',
        noCustomerData: 'No customer data yet',
    },
    pos: {
        title: 'Point of Sale',
        searchProducts: 'Search products...',
        cart: 'Cart',
        emptyCart: 'Cart is empty',
        addItemsToCart: 'Add items to start a sale',
        customer: 'Customer',
        selectCustomer: 'Select Customer',
        walkInCustomer: 'Walk-in Customer',
        subtotal: 'Subtotal',
        discount: 'Discount',
        tax: 'Tax',
        total: 'Total',
        pay: 'Pay',
        hold: 'Hold',
        clear: 'Clear',
        quantity: 'Qty',
        unitPrice: 'Unit Price',
        totalPrice: 'Total Price',
        removeItem: 'Remove',
        applyDiscount: 'Apply Discount',
        applyCoupon: 'Apply Coupon',
        payment: 'Payment',
        cash: 'Cash',
        card: 'Card',
        transfer: 'Transfer',
        amountTendered: 'Amount Tendered',
        change: 'Change',
        completePayment: 'Complete Payment',
        printReceipt: 'Print Receipt',
        newSale: 'New Sale',
        heldOrders: 'Held Orders',
        noHeldOrders: 'No held orders',
    },
    products: {
        title: 'Products',
        allProducts: 'All Products',
        addProduct: 'Add Product',
        editProduct: 'Edit Product',
        deleteProduct: 'Delete Product',
        productName: 'Product Name',
        sku: 'SKU',
        barcode: 'Barcode',
        category: 'Category',
        unitPrice: 'Unit Price',
        costPrice: 'Cost Price',
        salePrice: 'Sale Price',
        wholesalePrice: 'Wholesale Price',
        stockQuantity: 'Stock Quantity',
        lowStockAlert: 'Low Stock Alert',
        taxGroup: 'Tax Group',
        unit: 'Unit',
        status: 'Status',
        available: 'Available',
        unavailable: 'Unavailable',
        outOfStock: 'Out of Stock',
        lowStock: 'Low Stock',
        inStock: 'In Stock',
        searchProducts: 'Search products...',
        filterByCategory: 'Filter by category',
        filterByStatus: 'Filter by status',
        noProducts: 'No products found',
        productCreated: 'Product created successfully',
        productUpdated: 'Product updated successfully',
        productDeleted: 'Product deleted successfully',
        confirmDelete: 'Are you sure you want to delete this product?',
        stockManagement: 'Stock Management',
        enableStockTracking: 'Enable stock tracking',
        expirationTracking: 'Expiration Tracking',
        enableExpiration: 'Enable expiration tracking',
    },
    orders: {
        title: 'Orders',
        allOrders: 'All Orders',
        orderDetails: 'Order Details',
        orderCode: 'Order Code',
        orderDate: 'Order Date',
        customer: 'Customer',
        paymentStatus: 'Payment Status',
        deliveryStatus: 'Delivery Status',
        processStatus: 'Process Status',
        total: 'Total',
        paid: 'Paid',
        unpaid: 'Unpaid',
        partiallyPaid: 'Partially Paid',
        voided: 'Voided',
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled',
        delivered: 'Delivered',
        shipped: 'Shipped',
        items: 'Items',
        viewOrder: 'View Order',
        printInvoice: 'Print Invoice',
        addPayment: 'Add Payment',
        refundOrder: 'Refund Order',
        voidOrder: 'Void Order',
        noOrders: 'No orders found',
        searchOrders: 'Search orders...',
        filterByStatus: 'Filter by status',
        filterByDate: 'Filter by date',
    },
    customers: {
        title: 'Customers',
        allCustomers: 'All Customers',
        addCustomer: 'Add Customer',
        editCustomer: 'Edit Customer',
        deleteCustomer: 'Delete Customer',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        group: 'Group',
        address: 'Address',
        city: 'City',
        country: 'Country',
        pobox: 'PO Box',
        birthdate: 'Birthdate',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        accountBalance: 'Account Balance',
        owedAmount: 'Owed Amount',
        creditLimit: 'Credit Limit',
        totalPurchases: 'Total Purchases',
        rewardPoints: 'Reward Points',
        customerGroups: 'Customer Groups',
        addGroup: 'Add Group',
        editGroup: 'Edit Group',
        groupName: 'Group Name',
        groupDescription: 'Group Description',
        noCustomers: 'No customers found',
        customerCreated: 'Customer created successfully',
        customerUpdated: 'Customer updated successfully',
        customerDeleted: 'Customer deleted successfully',
        confirmDelete: 'Are you sure you want to delete this customer?',
    },
    reports: {
        title: 'Reports',
        salesReport: 'Sales Report',
        inventoryReport: 'Inventory Report',
        customerReport: 'Customer Report',
        cashFlowReport: 'Cash Flow Report',
        profitReport: 'Profit Report',
        paymentTypesReport: 'Payment Types Report',
        lowStockReport: 'Low Stock Report',
        bestProductsReport: 'Best Products Report',
        yearlyReport: 'Yearly Report',
        dateRange: 'Date Range',
        exportPDF: 'Export PDF',
        exportExcel: 'Export Excel',
        totalSales: 'Total Sales',
        totalOrders: 'Total Orders',
        averageOrder: 'Average Order',
        topSellingProducts: 'Top Selling Products',
        revenueByCategory: 'Revenue by Category',
        salesTrend: 'Sales Trend',
    },
    settings: {
        title: 'Settings',
        general: 'General',
        invoice: 'Invoice',
        pos: 'POS',
        orders: 'Orders',
        customers: 'Customers',
        accounting: 'Accounting',
        taxes: 'Taxes',
        units: 'Units',
        roles: 'Roles',
        users: 'Users',
        modules: 'Modules',
        receiptTemplate: 'Receipt Template',
        labelTemplates: 'Label Templates',
        systemInfo: 'System Info',
        systemReset: 'System Reset',
        storeName: 'Store Name',
        storeAddress: 'Store Address',
        storePhone: 'Store Phone',
        storeEmail: 'Store Email',
        currency: 'Currency',
        timezone: 'Timezone',
        dateFormat: 'Date Format',
        language: 'Language',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
    },
}

const id: TranslationKeys = {
    common: {
        save: 'Simpan',
        cancel: 'Batal',
        delete: 'Hapus',
        edit: 'Edit',
        add: 'Tambah',
        search: 'Cari',
        filter: 'Filter',
        export: 'Ekspor',
        import: 'Impor',
        loading: 'Memuat...',
        noData: 'Tidak ada data',
        confirm: 'Konfirmasi',
        back: 'Kembali',
        next: 'Selanjutnya',
        previous: 'Sebelumnya',
        close: 'Tutup',
        submit: 'Kirim',
        reset: 'Reset',
        clear: 'Hapus',
        all: 'Semua',
        none: 'Tidak ada',
        yes: 'Ya',
        no: 'Tidak',
        ok: 'OK',
        error: 'Error',
        success: 'Berhasil',
        warning: 'Peringatan',
        info: 'Info',
        actions: 'Aksi',
        status: 'Status',
        date: 'Tanggal',
        time: 'Waktu',
        amount: 'Jumlah',
        total: 'Total',
        subtotal: 'Subtotal',
        discount: 'Diskon',
        tax: 'Pajak',
        quantity: 'Kuantitas',
        price: 'Harga',
        name: 'Nama',
        description: 'Deskripsi',
        type: 'Tipe',
        category: 'Kategori',
        active: 'Aktif',
        inactive: 'Tidak Aktif',
        enabled: 'Aktif',
        disabled: 'Nonaktif',
        required: 'Wajib',
        optional: 'Opsional',
        from: 'Dari',
        to: 'Ke',
        today: 'Hari Ini',
        yesterday: 'Kemarin',
        thisWeek: 'Minggu Ini',
        lastWeek: 'Minggu Lalu',
        thisMonth: 'Bulan Ini',
        lastMonth: 'Bulan Lalu',
        thisYear: 'Tahun Ini',
        lastYear: 'Tahun Lalu',
    },
    auth: {
        login: 'Masuk',
        logout: 'Keluar',
        register: 'Daftar',
        forgotPassword: 'Lupa Password',
        resetPassword: 'Reset Password',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Konfirmasi Password',
        rememberMe: 'Ingat Saya',
        signIn: 'Masuk',
        signUp: 'Daftar',
        signOut: 'Keluar',
        welcome: 'Selamat Datang',
        welcomeBack: 'Selamat Datang Kembali',
        createAccount: 'Buat Akun',
        alreadyHaveAccount: 'Sudah punya akun?',
        dontHaveAccount: 'Belum punya akun?',
        enterEmail: 'Masukkan email Anda',
        enterPassword: 'Masukkan password Anda',
        invalidCredentials: 'Kredensial Tidak Valid',
        emailNotConfirmed: 'Email Belum Dikonfirmasi',
        tooManyRequests: 'Terlalu Banyak Percobaan',
        accountNotFound: 'Akun Tidak Ditemukan',
        connectionError: 'Koneksi Bermasalah',
        loginFailed: 'Login Gagal',
        systemError: 'Kesalahan Sistem',
        tryAgain: 'Coba Lagi',
        checkEmailPassword: 'Email atau password yang Anda masukkan salah. Silakan periksa kembali dan coba lagi.',
        checkSpamFolder: 'Periksa folder spam jika tidak menemukan email konfirmasi.',
        waitMinutes: 'Tunggu 5-10 menit sebelum mencoba lagi.',
        checkEmailOrRegister: 'Periksa email Anda atau daftar akun baru.',
        checkConnection: 'Pastikan Anda terhubung ke internet dan coba lagi.',
        reloadAndTry: 'Silakan muat ulang halaman dan coba lagi.',
        contactAdmin: 'Silakan coba lagi atau hubungi administrator.',
    },
    nav: {
        dashboard: 'Dasbor',
        pos: 'POS',
        products: 'Produk',
        allProducts: 'Semua Produk',
        addProduct: 'Tambah Produk',
        categories: 'Kategori',
        stockAdjustment: 'Penyesuaian Stok',
        orders: 'Pesanan',
        allOrders: 'Semua Pesanan',
        instalments: 'Cicilan',
        refunds: 'Pengembalian',
        customers: 'Pelanggan',
        allCustomers: 'Semua Pelanggan',
        customerGroups: 'Grup Pelanggan',
        procurements: 'Pengadaan',
        allProcurements: 'Semua Pengadaan',
        providers: 'Pemasok',
        registers: 'Kasir',
        transactions: 'Transaksi',
        reports: 'Laporan',
        sales: 'Penjualan',
        inventory: 'Inventaris',
        cashFlow: 'Arus Kas',
        profit: 'Keuntungan',
        paymentTypes: 'Tipe Pembayaran',
        lowStock: 'Stok Rendah',
        bestProducts: 'Produk Terlaris',
        yearly: 'Tahunan',
        coupons: 'Kupon',
        rewards: 'Hadiah',
        mediaLibrary: 'Perpustakaan Media',
        tools: 'Alat',
        dataManagement: 'Manajemen Data',
        bulkEditor: 'Editor Massal',
        settings: 'Pengaturan',
    },
    dashboard: {
        title: 'Dasbor',
        welcomeMessage: 'Selamat datang kembali',
        todayTransactions: 'Transaksi Hari Ini',
        weeklySales: 'Penjualan Mingguan',
        ordersSummary: 'Ringkasan Pesanan',
        salesLast7Days: 'Penjualan 7 Hari Terakhir',
        topCustomers: 'Pelanggan Terbaik',
        quickActions: 'Aksi Cepat',
        otherMenus: 'Menu Lainnya',
        openPOS: 'Buka POS',
        addProduct: 'Tambah Produk',
        customers: 'Pelanggan',
        orders: 'Pesanan',
        reports: 'Laporan',
        settings: 'Pengaturan',
        products: 'Produk',
        procurement: 'Pengadaan',
        register: 'Kasir',
        coupons: 'Kupon',
        manageInventory: 'Kelola inventaris',
        managePurchases: 'Kelola pembelian',
        manageCashier: 'Kelola kasir',
        manageDiscounts: 'Kelola diskon',
        startNewTransaction: 'Mulai transaksi baru',
        registerNewProduct: 'Daftarkan produk baru',
        manageCustomerData: 'Kelola data pelanggan',
        viewAllOrders: 'Lihat semua pesanan',
        salesAnalysis: 'Analisis penjualan',
        systemConfiguration: 'Konfigurasi sistem',
        fromYesterday: 'dari kemarin',
        fromLastWeek: 'dari minggu lalu',
        totalOrders: 'Total Pesanan',
        paid: 'Lunas',
        partial: 'Sebagian',
        unpaid: 'Belum Bayar',
        void: 'Batal',
        noCustomerData: 'Belum ada data pelanggan',
    },
    pos: {
        title: 'Point of Sale',
        searchProducts: 'Cari produk...',
        cart: 'Keranjang',
        emptyCart: 'Keranjang kosong',
        addItemsToCart: 'Tambahkan item untuk memulai penjualan',
        customer: 'Pelanggan',
        selectCustomer: 'Pilih Pelanggan',
        walkInCustomer: 'Pelanggan Umum',
        subtotal: 'Subtotal',
        discount: 'Diskon',
        tax: 'Pajak',
        total: 'Total',
        pay: 'Bayar',
        hold: 'Tahan',
        clear: 'Hapus',
        quantity: 'Qty',
        unitPrice: 'Harga Satuan',
        totalPrice: 'Total Harga',
        removeItem: 'Hapus',
        applyDiscount: 'Terapkan Diskon',
        applyCoupon: 'Terapkan Kupon',
        payment: 'Pembayaran',
        cash: 'Tunai',
        card: 'Kartu',
        transfer: 'Transfer',
        amountTendered: 'Jumlah Dibayar',
        change: 'Kembalian',
        completePayment: 'Selesaikan Pembayaran',
        printReceipt: 'Cetak Struk',
        newSale: 'Penjualan Baru',
        heldOrders: 'Pesanan Ditahan',
        noHeldOrders: 'Tidak ada pesanan ditahan',
    },
    products: {
        title: 'Produk',
        allProducts: 'Semua Produk',
        addProduct: 'Tambah Produk',
        editProduct: 'Edit Produk',
        deleteProduct: 'Hapus Produk',
        productName: 'Nama Produk',
        sku: 'SKU',
        barcode: 'Barcode',
        category: 'Kategori',
        unitPrice: 'Harga Satuan',
        costPrice: 'Harga Modal',
        salePrice: 'Harga Jual',
        wholesalePrice: 'Harga Grosir',
        stockQuantity: 'Jumlah Stok',
        lowStockAlert: 'Peringatan Stok Rendah',
        taxGroup: 'Grup Pajak',
        unit: 'Satuan',
        status: 'Status',
        available: 'Tersedia',
        unavailable: 'Tidak Tersedia',
        outOfStock: 'Habis',
        lowStock: 'Stok Rendah',
        inStock: 'Tersedia',
        searchProducts: 'Cari produk...',
        filterByCategory: 'Filter berdasarkan kategori',
        filterByStatus: 'Filter berdasarkan status',
        noProducts: 'Tidak ada produk ditemukan',
        productCreated: 'Produk berhasil dibuat',
        productUpdated: 'Produk berhasil diperbarui',
        productDeleted: 'Produk berhasil dihapus',
        confirmDelete: 'Apakah Anda yakin ingin menghapus produk ini?',
        stockManagement: 'Manajemen Stok',
        enableStockTracking: 'Aktifkan pelacakan stok',
        expirationTracking: 'Pelacakan Kedaluwarsa',
        enableExpiration: 'Aktifkan pelacakan kedaluwarsa',
    },
    orders: {
        title: 'Pesanan',
        allOrders: 'Semua Pesanan',
        orderDetails: 'Detail Pesanan',
        orderCode: 'Kode Pesanan',
        orderDate: 'Tanggal Pesanan',
        customer: 'Pelanggan',
        paymentStatus: 'Status Pembayaran',
        deliveryStatus: 'Status Pengiriman',
        processStatus: 'Status Proses',
        total: 'Total',
        paid: 'Lunas',
        unpaid: 'Belum Bayar',
        partiallyPaid: 'Sebagian Dibayar',
        voided: 'Dibatalkan',
        pending: 'Menunggu',
        processing: 'Diproses',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
        delivered: 'Terkirim',
        shipped: 'Dikirim',
        items: 'Item',
        viewOrder: 'Lihat Pesanan',
        printInvoice: 'Cetak Invoice',
        addPayment: 'Tambah Pembayaran',
        refundOrder: 'Kembalikan Pesanan',
        voidOrder: 'Batalkan Pesanan',
        noOrders: 'Tidak ada pesanan ditemukan',
        searchOrders: 'Cari pesanan...',
        filterByStatus: 'Filter berdasarkan status',
        filterByDate: 'Filter berdasarkan tanggal',
    },
    customers: {
        title: 'Pelanggan',
        allCustomers: 'Semua Pelanggan',
        addCustomer: 'Tambah Pelanggan',
        editCustomer: 'Edit Pelanggan',
        deleteCustomer: 'Hapus Pelanggan',
        firstName: 'Nama Depan',
        lastName: 'Nama Belakang',
        email: 'Email',
        phone: 'Telepon',
        group: 'Grup',
        address: 'Alamat',
        city: 'Kota',
        country: 'Negara',
        pobox: 'Kode Pos',
        birthdate: 'Tanggal Lahir',
        gender: 'Jenis Kelamin',
        male: 'Laki-laki',
        female: 'Perempuan',
        other: 'Lainnya',
        accountBalance: 'Saldo Akun',
        owedAmount: 'Hutang',
        creditLimit: 'Batas Kredit',
        totalPurchases: 'Total Pembelian',
        rewardPoints: 'Poin Reward',
        customerGroups: 'Grup Pelanggan',
        addGroup: 'Tambah Grup',
        editGroup: 'Edit Grup',
        groupName: 'Nama Grup',
        groupDescription: 'Deskripsi Grup',
        noCustomers: 'Tidak ada pelanggan ditemukan',
        customerCreated: 'Pelanggan berhasil dibuat',
        customerUpdated: 'Pelanggan berhasil diperbarui',
        customerDeleted: 'Pelanggan berhasil dihapus',
        confirmDelete: 'Apakah Anda yakin ingin menghapus pelanggan ini?',
    },
    reports: {
        title: 'Laporan',
        salesReport: 'Laporan Penjualan',
        inventoryReport: 'Laporan Inventaris',
        customerReport: 'Laporan Pelanggan',
        cashFlowReport: 'Laporan Arus Kas',
        profitReport: 'Laporan Keuntungan',
        paymentTypesReport: 'Laporan Tipe Pembayaran',
        lowStockReport: 'Laporan Stok Rendah',
        bestProductsReport: 'Laporan Produk Terlaris',
        yearlyReport: 'Laporan Tahunan',
        dateRange: 'Rentang Tanggal',
        exportPDF: 'Ekspor PDF',
        exportExcel: 'Ekspor Excel',
        totalSales: 'Total Penjualan',
        totalOrders: 'Total Pesanan',
        averageOrder: 'Rata-rata Pesanan',
        topSellingProducts: 'Produk Terlaris',
        revenueByCategory: 'Pendapatan per Kategori',
        salesTrend: 'Tren Penjualan',
    },
    settings: {
        title: 'Pengaturan',
        general: 'Umum',
        invoice: 'Invoice',
        pos: 'POS',
        orders: 'Pesanan',
        customers: 'Pelanggan',
        accounting: 'Akuntansi',
        taxes: 'Pajak',
        units: 'Satuan',
        roles: 'Peran',
        users: 'Pengguna',
        modules: 'Modul',
        receiptTemplate: 'Template Struk',
        labelTemplates: 'Template Label',
        systemInfo: 'Info Sistem',
        systemReset: 'Reset Sistem',
        storeName: 'Nama Toko',
        storeAddress: 'Alamat Toko',
        storePhone: 'Telepon Toko',
        storeEmail: 'Email Toko',
        currency: 'Mata Uang',
        timezone: 'Zona Waktu',
        dateFormat: 'Format Tanggal',
        language: 'Bahasa',
        theme: 'Tema',
        light: 'Terang',
        dark: 'Gelap',
        system: 'Sistem',
    },
}

export const translations: Record<Language, TranslationKeys> = { en, id }