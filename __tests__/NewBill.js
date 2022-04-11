/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock} from "../__mocks__/localStorage"
import store from "../__mocks__/store"
import Router from '../app/Router';
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { handleSubmit, updateBill} from "../containers/NewBill"
import { ROUTES_PATH } from "../constants/routes"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then I want to add a new bill", () => {
      const user = {type: 'Employee'}
      const localStorage = localStorageMock
      localStorage.setItem('user', JSON.stringify(user))
      const alertMock = jest.fn()
      Object.defineProperty(window, 'localStorage', {value: localStorage})
      Object.defineProperty(window, 'alert', {value: alertMock})
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}  
      const newBill = new NewBill({document, onNavigate, store, localStorage})
      const file = new File(["img"], "img.pdf"); 
      const inputFile = document.getElementById('inputfile')          
      fireEvent.change(inputFile, { target: { files: [file] } })      
      expect(alertMock).toHaveBeenCalled()   
    })

    test("Then I want to add a valid bill", () => {
      const user = {type: 'Employee'}
      const localStorage = localStorageMock
      localStorage.setItem('user', JSON.stringify(user))
      const alertMock = jest.fn()
      Object.defineProperty(window, 'localStorage', {value: localStorage})
      Object.defineProperty(window, 'alert', {value: alertMock})
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}  
      const newBill = new NewBill({document, onNavigate, store, localStorage})
      const file = new File(["img"], "img.png", {type : 'image/png'}); 
      const inputFile = document.getElementById('inputfile')          
      fireEvent.change(inputFile, { target: { files: [file] } })      
      expect(alertMock).not.toHaveBeenCalled()   
    })

    test("Then I want to submit my bill", () =>{
      const user = {type: 'Employee'}
      const localStorage = localStorageMock
      localStorage.setItem('user', JSON.stringify(user))
      Object.defineProperty(window, 'localStorage', {value: localStorage})
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = jest.fn()
      const newBill = new NewBill({document, onNavigate, store, localStorage})
      const email = JSON.parse(localStorage.getItem("user")).email
      const btn = screen.getByTestId('form-new-bill')
      fireEvent.submit(btn)
      expect(onNavigate).toHaveBeenCalled()
    })
  })
})

describe("Given I am a user connected as Employee", () => {
  describe("When I'm adding a new bill", () => {
    test("update bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
/*      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      Router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByText("Envoyer une note de frais"))
      console.log(document.getElementById('form-new-bill'))*/
      const html = NewBillUI()
      const onNavigate = jest.fn()
      const consoleErrorMock = jest.fn()
      console.error = consoleErrorMock
      const newBill = new NewBill({document, onNavigate, store, localStorage})

      const input = screen.getByTestId('expense-type')
      input.value = 'Transports'

      const btn = screen.getByTestId('form-new-bill')
      fireEvent.submit(btn)
      await new Promise((a) => setTimeout(a, 2000))
      expect(consoleErrorMock).not.toHaveBeenCalled()
    })
    
describe("When an error occurs on API", () => {
    beforeEach(() => {

      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      store.bills = jest.fn(() => {
        return {
          update : () =>  {
            return Promise.reject(new Error("Erreur 400"))
          }
        }})
        const html = NewBillUI()
        const onNavigate = jest.fn()
        const consoleErrorMock = jest.fn()
        console.error = consoleErrorMock
        const newBill = new NewBill({document, onNavigate, store, localStorage})      
        const btn = screen.getByTestId('form-new-bill')
        fireEvent.submit(btn)
        await new Promise((a) => setTimeout(a, 2000))
        expect(consoleErrorMock).toHaveBeenCalled()
    })


  })

  })
})


