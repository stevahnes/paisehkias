# 🏡 Housewarming Gift Assistant

## Project Description

This is a full-stack web application designed to act as a chat agent for newly-weds to help their friends with housewarming gift suggestions. The agent interacts with a Google Sheet, allowing friends to view available gift items and mark items as reserved. This helps the newlyweds discreetly manage their wish list without directly asking their friends for specific items.

## Features

- **Interactive Chat Agent**: Friends can chat with the agent to get gift suggestions.
- **Google Sheets Integration**: The agent reads from and updates a Google Sheet containing the housewarming wish list.
- **Gift Suggestions**: The agent suggests items from the list based on availability.
- **Gift Reservation**: Friends can inform the agent what they plan to get, and the agent will update the Google Sheet to mark the item as reserved.
- **Modern UI**: Built with Next.js, React, and Tailwind CSS for a responsive and user-friendly experience.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless Functions)
- **AI Integration**: LangChain.js with ChatGPT 4.1 Mini
- **Data Storage**: Google Sheets API

## Setup and Installation

Follow these steps to get the project up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version recommended)
- npm (Node Package Manager)
- A Google Cloud Project with Google Sheets API enabled.
- A Service Account with access to your Google Sheet.
- An OpenAI API Key.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/housewarming-agent.git
cd housewarming-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Google Sheet Setup

1.  **Create a new Google Sheet**: Name it something like "Housewarming Wish List".
2.  **Set up columns**: Your sheet should have the following columns starting from `A2` (row 1 is for headers):

    - `Name`
    - `Quantity`
    - `Reserved` (This column should contain "Yes" or "No")
    - `Reserved By`

    The current setup expects the data range `Gifts!A2:D`. Make sure your sheet name is `Gifts`.

3.  **Create a Google Cloud Service Account**:

    - Go to [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project or select an existing one.
    - Navigate to "APIs & Services" > "Credentials".
    - Click "+ CREATE CREDENTIALS" > "Service Account".
    - Give it a name and grant it the "Google Sheets API Editor" role (or a custom role with `sheets.spreadsheets.values.update` and `sheets.spreadsheets.values.get` permissions).
    - Create a new JSON key for the service account and download it. This file contains your `client_email` and `private_key`.

4.  **Share your Google Sheet with the Service Account**:
    - Open your Google Sheet.
    - Click the "Share" button.
    - Add the `client_email` from your downloaded JSON key file as an editor.

### 4. Environment Variables

Create a `.env.local` file in the root of your project (the `housewarming-agent` directory) and add the following:

```env
# Google Sheets API Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_ID=your-spreadsheet-id

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key
```

- **`GOOGLE_CLIENT_EMAIL`**: Copy this from your service account JSON file.
- **`GOOGLE_PRIVATE_KEY`**: Copy the entire `private_key` value from your JSON file. **Important**: Replace all newline characters ( `\n` ) with `\n` when copying into the `.env.local` file, and wrap the entire key in double quotes.
  For example: `"-----BEGIN PRIVATE KEY-----\nYOUR_KEY_LINE_1\nYOUR_KEY_LINE_2\n-----END PRIVATE KEY-----"`
- **`GOOGLE_SHEETS_ID`**: This is the ID found in your Google Sheet's URL. For example, in `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`, `YOUR_SPREADSHEET_ID` is what you need.
- **`OPENAI_API_KEY`**: Get this from your [OpenAI API dashboard](https://platform.openai.com/api-keys).

**_Security Note_**: Do not commit your `.env.local` file to version control. It's already included in `.gitignore`.

## Running the Application

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

Once the application is running, you can interact with the chat agent by typing messages in the input field. Here are some examples of what you can ask:

- "What gifts are on the list?"
- "Can you suggest something for the kitchen?"
- "I want to reserve the Hand Towel for John Doe."
- "What's still available?"

## Project Structure

```
housewarming-agent/
├── app/
│   ├── api/             # Next.js API Routes for chat and Google Sheets interaction
│   │   ├── chat/
│   │   │   └── route.ts # API endpoint for chat communication
│   │   └── sheets/        # (Optional) API endpoint for direct sheet interaction
│   ├── layout.tsx     # Root layout for the Next.js application
│   └── page.tsx       # Main page component (chat interface)
├── components/        # React components (e.g., chat UI)
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   └── MessageInput.tsx
│   └── ui/              # Shadcn/ui components
├── lib/                 # Utility functions and core logic
│   ├── sheets/
│   │   └── client.ts    # Google Sheets API client
│   ├── chat/
│   │   └── agent.ts     # LangChain agent logic
│   └── types/
│       └── index.ts     # TypeScript type definitions
├── public/              # Static assets
├── .env.example         # Example environment variables file
├── .env.local           # Local environment variables (ignored by git)
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
