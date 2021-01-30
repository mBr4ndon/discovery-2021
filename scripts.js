// Objects =====================================
const Modal = {
    open() {
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active');
    },
    close() {
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    store(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        this.all.push(transaction)
        App.reload()
    },

    remove(index) {
        this.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0;

        this.all.forEach((transaction) => {
            if (transaction.amount > 0) income += transaction.amount;
        })
        return income
    },

    expenses(){
        let expense = 0;

        this.all.forEach((transaction) => {
            if (transaction.amount < 0) expense += transaction.amount;
        })
        return expense
    },

    total(){
        return this.incomes() + this.expenses()
    }
}

// Utils =========================================
const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        value = value.toLocaleString("pt-PT", {
            style: "currency",
            currency: "EUR"
        })
        return (signal + value);

    },
    formatAmount(value) {
        return Number(value) * 100
    },
    formatDate(date) {
        const splitDate = date.split("-")
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    }
}

// DOM Manipulation ===============================
const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    addTransaction(transaction, index) {
        const table_row = document.createElement('tr');
        table_row.innerHTML = this.innerHTMLTransaction(transaction, index);
        table_row.dataset.index = index

        this.transactionsContainer.appendChild(table_row);
    },

    innerHTMLTransaction(transaction, index) {
        const classCSS = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${classCSS}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remove Transaction">
            </td>        
        `

        return html
    },

    updateBalance() {
        document
            .getElementById("income-display")
            .innerHTML = Utils.formatCurrency(Transaction.incomes());

        document
            .getElementById("expense-display")
            .innerHTML = Utils.formatCurrency(Transaction.expenses());

        document
            .getElementById("total-display")
            .innerHTML = Utils.formatCurrency(Transaction.total());

        if (Transaction.total() >= 0) {
            document
                .querySelector(".card.total")
                .classList
                .remove("negative")
        } else {
            document
                .querySelector(".card.total")
                .classList
                .add("negative")
        }
    },
    clearTransactions() {
        this.transactionsContainer.innerHTML = "";
    },
}

// Methods' invocation ===========================================
const App = {
    init() {        
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        DOM.updateBalance()
        Storage.store(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    
    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value,
        }
    },

    validate() {
        const {description, amount, date} = this.getValues()
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Empty fields")
        }
    },

    formatTransaction() {
        let {description, amount, date} = this.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {description,amount,date}
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    clearFields(){
        this.amount.value = ""
        this.description.value = ""
        this.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            this.validate()
            const transaction = this.formatTransaction()
            this.saveTransaction(transaction)
            this.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}


App.init();

