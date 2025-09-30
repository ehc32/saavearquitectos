import type { UserData, UserResponses } from "@/types/chatbot"

const LOCAL_STORAGE_KEY = "saave_quotation_data"

/**
 * Saves the user's quotation data (user info, responses, and economic proposal) to local storage.
 * @param userData - The user's personal information.
 * @param responses - The user's project configuration responses.
 * @param economicProposal - The detailed economic proposal JSON.
 */
export const saveQuotationDataToLocalStorage = (
  userData: UserData,
  responses: UserResponses,
  economicProposal: any, // Add economicProposal parameter
) => {
  try {
    const dataToSave = {
      userData,
      responses,
      economicProposal, // Include economicProposal
      timestamp: new Date().toISOString(), // Add a timestamp for when it was saved
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave))
    console.log("Quotation data saved to local storage:", dataToSave)
  } catch (error) {
    console.error("Failed to save data to local storage:", error)
  }
}

/**
 * Retrieves the last saved quotation data from local storage.
 * @returns The saved data or null if not found or an error occurs.
 */
export const loadQuotationDataFromLocalStorage = (): {
  userData: UserData
  responses: UserResponses
  economicProposal: any // Update return type
  timestamp: string
} | null => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      console.log("Quotation data loaded from local storage:", parsedData)
      return parsedData
    }
  } catch (error) {
    console.error("Failed to load data from local storage:", error)
  }
  return null
}

/**
 * Clears the saved quotation data from local storage.
 */
export const clearQuotationDataFromLocalStorage = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    console.log("Quotation data cleared from local storage.")
  } catch (error) {
    console.error("Failed to clear data from local storage:", error)
  }
}
