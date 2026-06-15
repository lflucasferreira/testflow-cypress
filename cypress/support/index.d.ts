/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    getByTestId(testId: string, options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>): Chainable<JQuery<HTMLElement>>
    getByHook(hook: string, options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>): Chainable<JQuery<HTMLElement>>
    assertHookVisible(hook: string): Chainable<JQuery<HTMLElement>>
    assertHookMissing(hook: string): Chainable<JQuery<HTMLElement>>
    login(email?: string, password?: string): Chainable<void>
    signInViaUI(email?: string, password?: string): Chainable<void>
    loginViaApi(email?: string, password?: string): Chainable<void>
    signInViaAPI(email?: string, password?: string): Chainable<void>
    visitAuthenticated(path: string): Chainable<void>
    visitAsUser(path: string): Chainable<void>
    createAuthSession(email?: string, password?: string): Chainable<void>
    visitWithSession(path?: string): Chainable<void>
    apiRequest(options: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<unknown>>
    apiWithAuth(options: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<unknown>>
    validateSchema(obj: object, schema: Record<string, string> | string): Chainable<void>
    validateJsonSchema(obj: object, schemaName: string): Chainable<void>
    assertResponseShape(obj: object, schema: Record<string, string> | string): Chainable<void>
    getTableRows(tableTestId?: string): Chainable<JQuery<HTMLElement>>
    getTableCell(rowId: string | number, field: string): Chainable<JQuery<HTMLElement>>
    checkA11yPage(context?: string | Node | Cypress.Chainable, options?: object): Chainable<void>
    clickDialogConfirm(): Chainable<JQuery<HTMLElement>>
    clickDialogCancel(): Chainable<JQuery<HTMLElement>>
    clickDialogClose(): Chainable<JQuery<HTMLElement>>
    searchTable(term: string): Chainable<JQuery<HTMLElement>>
    mountWithProviders(component: unknown): Chainable<void>
  }
}
