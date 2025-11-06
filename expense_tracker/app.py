import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, date
import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

# Page configuration
st.set_page_config(
    page_title="Expense Tracker",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #667eea;
    }
    .stButton>button {
        width: 100%;
        border-radius: 0.5rem;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: 600;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if "token" not in st.session_state:
    st.session_state.token = None
if "user_email" not in st.session_state:
    st.session_state.user_email = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

def get_headers():
    """Get headers with authentication token"""
    headers = {"Content-Type": "application/json"}
    if st.session_state.token:
        headers["Authorization"] = f"Bearer {st.session_state.token}"
    return headers

def login(email, password):
    """Login user"""
    try:
        data = {
            "username": email,
            "password": password
        }
        response = requests.post(
            f"{API_BASE_URL}/token",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            result = response.json()
            st.session_state.token = result["access_token"]
            st.session_state.user_email = email
            return True, "Login successful!"
        else:
            return False, response.json().get("detail", "Login failed")
    except Exception as e:
        return False, f"Error: {str(e)}"

def register_send_otp(email):
    """Send OTP for registration"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/register",
            json={"email": email},
            headers=get_headers()
        )
        if response.status_code == 200:
            return True, response.json().get("message", "OTP sent successfully")
        else:
            return False, response.json().get("detail", "Failed to send OTP")
    except Exception as e:
        return False, f"Error: {str(e)}"

def verify_otp_and_register(email, otp, password):
    """Verify OTP and complete registration"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/register/verify",
            json={"email": email, "otp": int(otp), "password": password},
            headers=get_headers()
        )
        if response.status_code == 200:
            return True, response.json().get("message", "Registration successful!")
        else:
            return False, response.json().get("detail", "Registration failed")
    except Exception as e:
        return False, f"Error: {str(e)}"

def get_expenses():
    """Get all expenses"""
    try:
        response = requests.get(
            f"{API_BASE_URL}/getexpense",
            headers=get_headers()
        )
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, []
    except Exception as e:
        return False, []

def add_expense(category, amount, amount_type, expense_date):
    """Add new expense"""
    try:
        data = {
            "category": category,
            "amount": float(amount),
            "amount_type": amount_type,
            "date": expense_date.isoformat() if expense_date else None
        }
        response = requests.post(
            f"{API_BASE_URL}/addexpense",
            json=data,
            headers=get_headers()
        )
        if response.status_code == 200:
            return True, "Expense added successfully!"
        else:
            return False, response.json().get("detail", "Failed to add expense")
    except Exception as e:
        return False, f"Error: {str(e)}"

def update_expense(expense_id, category=None, amount=None, expense_date=None):
    """Update expense"""
    try:
        data = {}
        if category:
            data["category"] = category
        if amount:
            data["amount"] = float(amount)
        if expense_date:
            data["date"] = expense_date.isoformat()
        
        response = requests.post(
            f"{API_BASE_URL}/update_expense/{expense_id}",
            json=data,
            headers=get_headers()
        )
        if response.status_code == 200:
            return True, "Expense updated successfully!"
        else:
            return False, response.json().get("detail", "Failed to update expense")
    except Exception as e:
        return False, f"Error: {str(e)}"

def delete_expense(expense_id):
    """Delete expense"""
    try:
        response = requests.delete(
            f"{API_BASE_URL}/delete_expense/{expense_id}",
            headers=get_headers()
        )
        if response.status_code == 200:
            return True, "Expense deleted successfully!"
        else:
            return False, response.json().get("detail", "Failed to delete expense")
    except Exception as e:
        return False, f"Error: {str(e)}"

def chat_with_ai(query):
    """Chat with AI assistant"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/chat",
            json={"query": query},
            headers=get_headers()
        )
        if response.status_code == 200:
            return True, response.json().get("response", "No response")
        else:
            return False, response.json().get("detail", "Failed to get response")
    except Exception as e:
        return False, f"Error: {str(e)}"

def logout():
    """Logout user"""
    st.session_state.token = None
    st.session_state.user_email = None
    st.session_state.chat_history = []
    st.rerun()

# Main App
if not st.session_state.token:
    # Authentication Page
    st.markdown('<h1 class="main-header">💰 Expense Tracker</h1>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Login", "Register"])
    
    with tab1:
        st.subheader("Login to Your Account")
        with st.form("login_form"):
            email = st.text_input("Email", placeholder="your@email.com")
            password = st.text_input("Password", type="password")
            submit = st.form_submit_button("Login", type="primary")
            
            if submit:
                if email and password:
                    success, message = login(email, password)
                    if success:
                        st.success(message)
                        st.rerun()
                    else:
                        st.error(message)
                else:
                    st.warning("Please fill in all fields")
    
    with tab2:
        st.subheader("Create New Account")
        register_step = st.radio("Step", ["Send OTP", "Verify OTP"], horizontal=True)
        
        if register_step == "Send OTP":
            with st.form("register_step1"):
                reg_email = st.text_input("Email", placeholder="your@email.com", key="reg_email")
                submit_otp = st.form_submit_button("Send OTP", type="primary")
                
                if submit_otp:
                    if reg_email:
                        success, message = register_send_otp(reg_email)
                        if success:
                            st.success(message)
                            st.session_state.reg_email = reg_email
                            st.rerun()
                        else:
                            st.error(message)
                    else:
                        st.warning("Please enter your email")
        
        else:
            if "reg_email" not in st.session_state:
                st.warning("Please send OTP first")
            else:
                with st.form("register_step2"):
                    st.text_input("Email", value=st.session_state.reg_email, disabled=True)
                    otp = st.text_input("OTP Code", placeholder="123456", max_chars=6)
                    reg_password = st.text_input("Password", type="password", key="reg_password")
                    confirm_password = st.text_input("Confirm Password", type="password", key="confirm_password")
                    submit_reg = st.form_submit_button("Register", type="primary")
                    
                    if submit_reg:
                        if otp and reg_password:
                            if reg_password == confirm_password:
                                success, message = verify_otp_and_register(
                                    st.session_state.reg_email, otp, reg_password
                                )
                                if success:
                                    st.success(message)
                                    st.info("Please login with your credentials")
                                    del st.session_state.reg_email
                                else:
                                    st.error(message)
                            else:
                                st.error("Passwords do not match")
                        else:
                            st.warning("Please fill in all fields")

else:
    # Main Dashboard
    st.sidebar.title("💰 Expense Tracker")
    st.sidebar.write(f"Welcome, {st.session_state.user_email}")
    
    if st.sidebar.button("Logout", type="primary"):
        logout()
    
    # Main tabs
    tab1, tab2, tab3, tab4 = st.tabs(["📊 Dashboard", "➕ Add Expense", "📝 Expenses", "🤖 AI Assistant"])
    
    # Dashboard Tab
    with tab1:
        st.header("📊 Expense Dashboard")
        
        # Get expenses
        success, expenses = get_expenses()
        
        if success and expenses:
            df = pd.DataFrame(expenses)
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'], errors='coerce')
            
            # Calculate totals
            total_income = sum(e.get('amount', 0) for e in expenses if e.get('amount_type') == 'credit')
            total_expenses = sum(e.get('amount', 0) for e in expenses if e.get('amount_type') == 'debit')
            balance = total_income - total_expenses
            
            # Metrics
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("Total Balance", f"${balance:,.2f}", delta=f"${balance:,.2f}")
            with col2:
                st.metric("Total Income", f"${total_income:,.2f}", delta="Income")
            with col3:
                st.metric("Total Expenses", f"${total_expenses:,.2f}", delta="Expenses")
            with col4:
                st.metric("Total Transactions", len(expenses))
            
            st.divider()
            
            # Charts
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("Income vs Expenses")
                if len(expenses) > 0:
                    chart_df = pd.DataFrame([
                        {"Type": "Income", "Amount": total_income},
                        {"Type": "Expenses", "Amount": total_expenses}
                    ])
                    fig = px.bar(chart_df, x="Type", y="Amount", color="Type",
                                color_discrete_map={"Income": "#10b981", "Expenses": "#ef4444"})
                    fig.update_layout(showlegend=False, height=300)
                    st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                st.subheader("Expenses by Category")
                if len(expenses) > 0:
                    expense_df = pd.DataFrame([e for e in expenses if e.get('amount_type') == 'debit'])
                    if len(expense_df) > 0:
                        category_sum = expense_df.groupby('category')['amount'].sum().reset_index()
                        fig = px.pie(category_sum, values='amount', names='category', hole=0.4)
                        fig.update_layout(height=300)
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.info("No expenses to display")
            
            # Monthly trends
            st.subheader("Monthly Trends")
            if 'date' in df.columns and len(df) > 0:
                df['month'] = df['date'].dt.to_period('M').astype(str)
                monthly = df.groupby(['month', 'amount_type'])['amount'].sum().reset_index()
                fig = px.line(monthly, x='month', y='amount', color='amount_type',
                            color_discrete_map={"credit": "#10b981", "debit": "#ef4444"},
                            labels={'amount': 'Amount ($)', 'month': 'Month', 'amount_type': 'Type'})
                fig.update_layout(height=400)
                st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No expenses yet. Add your first expense to see analytics!")
    
    # Add Expense Tab
    with tab2:
        st.header("➕ Add New Expense")
        
        with st.form("add_expense_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                category = st.text_input("Category", placeholder="e.g., Food, Salary, Rent")
                amount = st.number_input("Amount", min_value=0.0, step=0.01, format="%.2f")
            
            with col2:
                amount_type = st.selectbox("Type", ["debit", "credit"], 
                                          format_func=lambda x: "Expense" if x == "debit" else "Income")
                expense_date = st.date_input("Date", value=date.today())
            
            submit = st.form_submit_button("Add Expense", type="primary")
            
            if submit:
                if category and amount:
                    success, message = add_expense(category, amount, amount_type, expense_date)
                    if success:
                        st.success(message)
                        st.rerun()
                    else:
                        st.error(message)
                else:
                    st.warning("Please fill in all required fields")
    
    # Expenses Tab
    with tab3:
        st.header("📝 Your Expenses")
        
        success, expenses = get_expenses()
        
        if success and expenses:
            # Search and filter
            col1, col2 = st.columns([3, 1])
            with col1:
                search_term = st.text_input("🔍 Search", placeholder="Search by category...")
            with col2:
                filter_type = st.selectbox("Filter", ["All", "Income", "Expenses"])
            
            # Filter expenses
            filtered_expenses = expenses
            if search_term:
                filtered_expenses = [e for e in filtered_expenses 
                                   if search_term.lower() in e.get('category', '').lower()]
            if filter_type == "Income":
                filtered_expenses = [e for e in filtered_expenses if e.get('amount_type') == 'credit']
            elif filter_type == "Expenses":
                filtered_expenses = [e for e in filtered_expenses if e.get('amount_type') == 'debit']
            
            if filtered_expenses:
                # Display expenses
                for expense in filtered_expenses:
                    with st.expander(f"{expense.get('category', 'N/A')} - ${expense.get('amount', 0):,.2f}", expanded=False):
                        col1, col2, col3 = st.columns([2, 1, 1])
                        
                        with col1:
                            st.write(f"**Type:** {'Income' if expense.get('amount_type') == 'credit' else 'Expense'}")
                            if expense.get('date'):
                                st.write(f"**Date:** {expense['date']}")
                        
                        with col2:
                            if st.button("✏️ Edit", key=f"edit_{expense['id']}"):
                                st.session_state.edit_expense = expense
                                st.rerun()
                        
                        with col3:
                            if st.button("🗑️ Delete", key=f"delete_{expense['id']}"):
                                success, message = delete_expense(expense['id'])
                                if success:
                                    st.success(message)
                                    st.rerun()
                                else:
                                    st.error(message)
                
                # Edit form
                if "edit_expense" in st.session_state:
                    st.divider()
                    st.subheader("Edit Expense")
                    expense = st.session_state.edit_expense
                    
                    with st.form("edit_expense_form"):
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            edit_category = st.text_input("Category", value=expense.get('category', ''))
                            edit_amount = st.number_input("Amount", min_value=0.0, step=0.01, 
                                                         value=float(expense.get('amount', 0)), format="%.2f")
                        
                        with col2:
                            if expense.get('date'):
                                try:
                                    date_value = datetime.fromisoformat(str(expense['date'])).date()
                                except:
                                    date_value = date.today()
                                edit_date = st.date_input("Date", value=date_value)
                            else:
                                edit_date = st.date_input("Date", value=date.today())
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            if st.form_submit_button("Update", type="primary"):
                                success, message = update_expense(
                                    expense['id'], 
                                    edit_category if edit_category != expense.get('category') else None,
                                    edit_amount if edit_amount != expense.get('amount') else None,
                                    edit_date
                                )
                                if success:
                                    st.success(message)
                                    del st.session_state.edit_expense
                                    st.rerun()
                                else:
                                    st.error(message)
                        
                        with col2:
                            if st.form_submit_button("Cancel"):
                                del st.session_state.edit_expense
                                st.rerun()
            else:
                st.info("No expenses found matching your search.")
        else:
            st.info("No expenses yet. Add your first expense!")
    
    # AI Assistant Tab
    with tab4:
        st.header("🤖 AI Expense Assistant")
        st.write("Ask me anything about your expenses!")
        
        # Display chat history
        for chat in st.session_state.chat_history:
            if chat['role'] == 'user':
                with st.chat_message("user"):
                    st.write(chat['content'])
            else:
                with st.chat_message("assistant"):
                    st.write(chat['content'])
        
        # Chat input
        user_query = st.chat_input("Ask a question about your expenses...")
        
        if user_query:
            # Add user message to history
            st.session_state.chat_history.append({"role": "user", "content": user_query})
            
            # Get AI response
            with st.spinner("Thinking..."):
                success, response = chat_with_ai(user_query)
            
            if success:
                st.session_state.chat_history.append({"role": "assistant", "content": response})
                st.rerun()
            else:
                st.error(response)
                st.session_state.chat_history.append({"role": "assistant", "content": "Sorry, I encountered an error."})
                st.rerun()
        
        # Clear chat button
        if st.button("Clear Chat"):
            st.session_state.chat_history = []
            st.rerun()

