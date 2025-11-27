**Tags**: #solid #principles #design
**Links**: [[SOLID-Principles]], [[Clean-Code]], [[Refactoring]]

---

### Single Responsibility Principle (SRP)

A class should have only one reason to change. Each class should do one thing well.

**Violation:**
```csharp
// BAD - multiple responsibilities
public class Employee
{
    public string Name { get; set; }
    public decimal Salary { get; set; }

    public decimal CalculatePay() { /* payroll logic */ }
    public void Save() { /* database logic */ }
    public string GenerateReport() { /* reporting logic */ }
}
```

**Following SRP:**
```csharp
// GOOD - separated responsibilities
public class Employee
{
    public string Name { get; set; }
    public decimal Salary { get; set; }
}

public class PayrollCalculator
{
    public decimal CalculatePay(Employee employee) { ... }
}

public class EmployeeRepository
{
    public void Save(Employee employee) { ... }
}

public class EmployeeReportGenerator
{
    public string Generate(Employee employee) { ... }
}
```

**Signs of SRP violation:**
- Class has many public methods doing different things
- Class name contains "And" or "Manager" or "Handler"
- Changes in unrelated features require modifying the same class
- Hard to name the class because it does too much

**Related:**
- [[SOLID-Principles]] - SRP is the S in SOLID
- [[Separation-of-Concerns]] - architectural SRP
- [[Refactoring]] - extracting classes

