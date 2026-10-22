const API_URL = "http://127.0.0.1:8000/employees";


// ==============================
// DOM ELEMENTS
// ==============================

const employeeForm = document.getElementById("employeeForm");
const employeeIdInput = document.getElementById("employeeId");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const salaryInput = document.getElementById("salary");

const employeeTableBody =
    document.getElementById("employeeTableBody");

const totalEmployees =
    document.getElementById("totalEmployees");

const totalDepartments =
    document.getElementById("totalDepartments");

const averageSalary =
    document.getElementById("averageSalary");

const directoryCount =
    document.getElementById("directoryCount");

const visibleEmployees =
    document.getElementById("visibleEmployees");

const searchInput =
    document.getElementById("searchInput");

const departmentFilter =
    document.getElementById("departmentFilter");

const submitBtn =
    document.getElementById("submitBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const formTitle =
    document.getElementById("formTitle");

const message =
    document.getElementById("message");


// ==============================
// APPLICATION STATE
// ==============================

let employees = [];
let messageTimer;


// ==============================
// FORMAT HELPERS
// ==============================

function formatCurrency(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}


function getInitials(name) {
    const words = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return "?";
    }

    return words
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}


function getAvatarColor(name) {
    const colors = [
        ["#f0edff", "#6551cb"],
        ["#eaf4ff", "#2776c6"],
        ["#e7f8ef", "#16825d"],
        ["#fff4e5", "#c07824"],
        ["#ffedf4", "#c24d7b"],
        ["#edf1f5", "#5b687c"]
    ];

    let hash = 0;

    for (const character of String(name || "")) {
        hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }

    return colors[hash % colors.length];
}


function getDepartmentClass(department) {
    const departments = [...new Set(
        employees.map(employee =>
            String(employee.department || "")
                .trim()
                .toLowerCase()
        )
    )].sort();

    const index = departments.indexOf(
        String(department || "").trim().toLowerCase()
    );

    return `dept-${Math.max(0, index) % 6}`;
}


// ==============================
// TOAST NOTIFICATIONS
// ==============================

function showMessage(text, type = "success") {
    clearTimeout(messageTimer);

    message.textContent = text;
    message.className = `toast ${type}`;

    messageTimer = setTimeout(() => {
        message.classList.add("hidden");
    }, 3500);
}


// ==============================
// API REQUEST HELPER
// ==============================

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...options.headers
        }
    });

    if (!response.ok) {
        let errorMessage = `Request failed (${response.status})`;

        try {
            const errorData = await response.json();

            if (Array.isArray(errorData.detail)) {
                errorMessage = errorData.detail
                    .map(error => {
                        const field = error.loc?.at(-1);

                        return `${field || "Field"}: ${error.msg}`;
                    })
                    .join(", ");
            } else if (typeof errorData.detail === "string") {
                errorMessage = errorData.detail;
            }
        } catch {
            // Keep the default error message.
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204 || response.status === 205) {
        return null;
    }

    const text = await response.text();

    return text ? JSON.parse(text) : null;
}


// ==============================
// LOAD EMPLOYEES
// ==============================

async function loadEmployees() {
    employeeTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="loading-cell">
                Loading employees...
            </td>
        </tr>
    `;

    refreshBtn.disabled = true;

    try {
        const data = await apiRequest(API_URL);

        if (!Array.isArray(data)) {
            throw new Error(
                "The employee API did not return a list of employees."
            );
        }

        employees = data;

        updateDashboard();
        updateDepartmentFilter();
        renderEmployees();

    } catch (error) {
        console.error("Error loading employees:", error);

        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">
                    Unable to load employees. Please check your API connection.
                </td>
            </tr>
        `;

        totalEmployees.textContent = "—";
        totalDepartments.textContent = "—";
        averageSalary.textContent = "—";
        directoryCount.textContent = "0";
        visibleEmployees.textContent = "0";

        showMessage(error.message, "error");

    } finally {
        refreshBtn.disabled = false;
    }
}


// ==============================
// DASHBOARD STATISTICS
// ==============================

function updateDashboard() {
    const departments = new Set(
        employees
            .map(employee =>
                String(employee.department || "").trim().toLowerCase()
            )
            .filter(Boolean)
    );

    const totalSalary = employees.reduce(
        (sum, employee) => sum + Number(employee.salary || 0),
        0
    );

    const average = employees.length
        ? totalSalary / employees.length
        : 0;

    totalEmployees.textContent = employees.length;

    totalDepartments.textContent = departments.size;

    averageSalary.textContent = formatCurrency(average);

    directoryCount.textContent = employees.length;
}


// ==============================
// DEPARTMENT FILTER
// ==============================

function updateDepartmentFilter() {
    const currentValue = departmentFilter.value;

    const departments = [...new Set(
        employees
            .map(employee =>
                String(employee.department || "").trim()
            )
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    departmentFilter.replaceChildren();

    const allOption = document.createElement("option");

    allOption.value = "";
    allOption.textContent = "All Departments";

    departmentFilter.appendChild(allOption);

    departments.forEach(department => {
        const option = document.createElement("option");

        option.value = department;
        option.textContent = department;

        departmentFilter.appendChild(option);
    });

    const matchingDepartment = departments.find(
        department => department === currentValue
    );

    departmentFilter.value = matchingDepartment || "";
}


// ==============================
// RENDER EMPLOYEE TABLE
// ==============================

function renderEmployees() {
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const selectedDepartment = departmentFilter.value
        .trim()
        .toLowerCase();

    const filteredEmployees = employees.filter(employee => {
        const name = String(employee.name || "").toLowerCase();
        const email = String(employee.email || "").toLowerCase();

        const department = String(
            employee.department || ""
        ).toLowerCase();

        const matchesSearch =
            name.includes(searchTerm) ||
            email.includes(searchTerm) ||
            department.includes(searchTerm);

        const matchesDepartment =
            !selectedDepartment ||
            department === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    visibleEmployees.textContent = filteredEmployees.length;

    employeeTableBody.replaceChildren();

    if (filteredEmployees.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-cell";

        cell.textContent = employees.length
            ? "No employees match your search."
            : "No employees found. Add your first employee above.";

        row.appendChild(cell);
        employeeTableBody.appendChild(row);

        return;
    }

    filteredEmployees.forEach(employee => {
        const row = document.createElement("tr");

        // EMPLOYEE NAME AND AVATAR

        const employeeCell = document.createElement("td");

        const employeeWrapper = document.createElement("div");
        employeeWrapper.className = "employee-cell";

        const avatar = document.createElement("div");
        avatar.className = "avatar";

        const [avatarBackground, avatarText] =
            getAvatarColor(employee.name);

        avatar.style.backgroundColor = avatarBackground;
        avatar.style.color = avatarText;
        avatar.textContent = getInitials(employee.name);

        const employeeInfo = document.createElement("div");
        employeeInfo.className = "employee-info";

        const employeeName = document.createElement("div");
        employeeName.className = "employee-name";
        employeeName.textContent = employee.name;

        const employeeCode = document.createElement("div");
        employeeCode.className = "employee-id";
        employeeCode.textContent = `ID: ${employee.id}`;

        employeeInfo.append(employeeName, employeeCode);

        employeeWrapper.append(avatar, employeeInfo);

        employeeCell.appendChild(employeeWrapper);


        // EMAIL

        const emailCell = document.createElement("td");
        emailCell.textContent = employee.email;


        // DEPARTMENT BADGE

        const departmentCell = document.createElement("td");

        const departmentBadge = document.createElement("span");

        departmentBadge.className =
            `department-badge ${getDepartmentClass(employee.department)}`;

        departmentBadge.textContent = employee.department;

        departmentCell.appendChild(departmentBadge);


        // SALARY

        const salaryCell = document.createElement("td");

        salaryCell.textContent = formatCurrency(employee.salary);


        // ACTION BUTTONS

        const actionsCell = document.createElement("td");

        const actionWrapper = document.createElement("div");
        actionWrapper.className = "action-buttons";

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            `Edit employee ${employee.name}`
        );

        editButton.addEventListener("click", () => {
            editEmployee(employee.id);
        });


        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete employee ${employee.name}`
        );

        deleteButton.addEventListener("click", () => {
            deleteEmployee(employee.id);
        });


        actionWrapper.append(editButton, deleteButton);
        actionsCell.appendChild(actionWrapper);


        row.append(
            employeeCell,
            emailCell,
            departmentCell,
            salaryCell,
            actionsCell
        );

        employeeTableBody.appendChild(row);
    });
}


// ==============================
// CREATE AND UPDATE EMPLOYEES
// ==============================

employeeForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!employeeForm.reportValidity()) {
        return;
    }

    const id = employeeIdInput.value;

    const employeeData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        department: departmentInput.value.trim(),
        salary: Number(salaryInput.value)
    };

    if (
        !employeeData.name ||
        !employeeData.email ||
        !employeeData.department ||
        !Number.isFinite(employeeData.salary) ||
        employeeData.salary <= 0
    ) {
        showMessage(
            "Please enter valid employee details and a salary greater than zero.",
            "error"
        );

        return;
    }

    const originalButtonText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = id ? "Updating..." : "Adding...";

    try {
        if (id) {
            await apiRequest(`${API_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(employeeData)
            });

            showMessage("Employee updated successfully!");

        } else {
            await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify(employeeData)
            });

            showMessage("Employee added successfully!");
        }

        resetForm();

        await loadEmployees();

    } catch (error) {
        console.error("Error saving employee:", error);

        showMessage(error.message, "error");

    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalButtonText;
    }
});


// ==============================
// EDIT EMPLOYEE
// ==============================

function editEmployee(id) {
    const employee = employees.find(
        item => String(item.id) === String(id)
    );

    if (!employee) {
        showMessage("Employee not found.", "error");
        return;
    }

    employeeIdInput.value = employee.id;

    nameInput.value = employee.name;
    emailInput.value = employee.email;
    departmentInput.value = employee.department;
    salaryInput.value = employee.salary;

    formTitle.textContent = "Edit Employee";

    submitBtn.textContent = "Save Changes";

    cancelBtn.classList.remove("hidden");

    document.getElementById("employeeFormSection")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    nameInput.focus();
}


// ==============================
// DELETE EMPLOYEE
// ==============================

async function deleteEmployee(id) {
    const employee = employees.find(
        item => String(item.id) === String(id)
    );

    if (!employee) {
        showMessage("Employee not found.", "error");
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (String(employeeIdInput.value) === String(id)) {
            resetForm();
        }

        showMessage("Employee deleted successfully!");

        await loadEmployees();

    } catch (error) {
        console.error("Error deleting employee:", error);

        showMessage(error.message, "error");
    }
}


// ==============================
// RESET FORM
// ==============================

function resetForm() {
    employeeForm.reset();

    employeeIdInput.value = "";

    formTitle.textContent = "Add New Employee";

    submitBtn.textContent = "+ Add Employee";

    cancelBtn.classList.add("hidden");
}


// ==============================
// EVENT LISTENERS
// ==============================

cancelBtn.addEventListener("click", resetForm);

refreshBtn.addEventListener("click", loadEmployees);

searchInput.addEventListener("input", renderEmployees);

departmentFilter.addEventListener("change", renderEmployees);


// ==============================
// START APPLICATION
// ==============================

loadEmployees();