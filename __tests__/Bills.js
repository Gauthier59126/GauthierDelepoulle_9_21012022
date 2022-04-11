/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { ROUTES_PATH } from "../constants/routes"
import { ROUTES } from "../constants/routes"
import Bill from "../containers/Bills"
import { screen, waitFor } from "@testing-library/dom"
import mockStore from "../__mocks__/store"
import Router from '../app/Router';
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock} from "../__mocks__/localStorage"
import userEvent from '@testing-library/user-event'

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      document.body.innerHTML = '<div id="root"></div>'
      const user = {type: 'Employee'}
      const localStorage = localStorageMock
      localStorage.setItem('user', JSON.stringify(user))
      Object.defineProperty(window, 'location', {value: {pathname: ROUTES_PATH["Bills"] } })
      Object.defineProperty(window, 'localStorage', {value: localStorage})
      Router()
      window.onNavigate(ROUTES_PATH['Bills'])
      console.log(document.body.innerHTML)
      const icon = screen.getByTestId('icon-window')
      expect(icon).toHaveClass('active-icon')
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I'm clicking on the eye icon in order to show the bill", () =>{
      test("Then bill should be displayed on a modal", () =>{
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}  
        const openModal = jest.fn()        
        const $ = () => {
          return {width: jest.fn(), find: jest.fn(() => {return {html: jest.fn()}}), modal: openModal, click: jest.fn()}
        }
        window.$ = $
        const bill = new Bill({document, onNavigate, store: null, localStorage: localStorageMock}) 
        const handleClickIconEye = jest.fn() 
        const eyeIcon = document.getElementById('eye')          
        userEvent.click(eyeIcon) 
        expect(openModal).toHaveBeenCalledWith('show')        
      })
    })

    //test d'intégration get bills
    describe("Given I am a user connected as Employee", () => {
      describe("When I navigate to Bills page", () => {
        test("fetches bills from mock API GET", async () => {
          localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.append(root)
          Router()
          window.onNavigate(ROUTES_PATH.Bills)
          await waitFor(() => screen.getByText("Mes notes de frais"))
          const newBillButton  =  screen.getByTestId("btn-new-bill")
          expect(newBillButton).toBeTruthy()
        })
      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
              window,
              'localStorage',
              { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "a@a"
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          Router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
    
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }})
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })
    
        test("fetches messages from an API and fails with 500 message error", async () => {
    
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }})
    
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    
      })
    })
  })
})
