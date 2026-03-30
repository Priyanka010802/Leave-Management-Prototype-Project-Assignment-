describe('Leave Management System E2E Tests', () => {

  it('fails to apply back-dated leave (Employee View)', () => {
    cy.visit('http://localhost:3000/');

    
    cy.get('select[name="role"]').select('Employee');
    cy.get('input[name="username"]').type('Test User');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();

    
    cy.get('input[name="startDate"]').type('2025-01-01');
    cy.get('input[name="endDate"]').type('2025-01-05');
    cy.get('textarea[name="reason"]').type('Test Back-dated leave');

    cy.get('button[type="submit"]').click();

    
    cy.contains('Cannot apply leave in the past.').should('be.visible');
  });

  it('persists filters after refresh (Manager View)', () => {
    cy.visit('http://localhost:3000/');

    cy.get('select[name="role"]').select('Manager');
    cy.get('input[name="username"]').type('manager');
    cy.get('input[name="password"]').type('manager@123');
    cy.get('button[type="submit"]').click();

    
    cy.get('input[name="employee"]').type('Alice');
    cy.get('select[name="status"]').select('Pending');

   
    cy.url().should('include', 'employee=Alice');
    cy.url().should('include', 'status=Pending');

    cy.reload();

    
    cy.get('input[name="employee"]').should('have.value', 'Alice');
    cy.get('select[name="status"]').should('have.value', 'Pending');
  });

});

