# AMCS Navigator

AMCS Navigator is a full-stack campus navigation and timetable assistant for the AMCS environment.

It helps users:

- Select a start block and floor
- Select a destination block and floor
- Visualize a shortest path on the campus map
- View timetable data by programme and semester
- Use smart destination suggestions based on class timing

## Project Structure

- backend: FastAPI service for routing and timetable endpoints
- frontend: React + Vite application for the interactive map and guide UI

## Key Features

1. Interactive Campus Map

- Block selection with floor-aware navigation
- Route rendering with visual path segments
- Text route instructions

2. Timetable Integration

- Programme and semester filters
- Timetable loading from backend APIs
- Day and period based data handling

3. Smart Destination

- Previous, current, and next class modes
- Auto-suggest destination from timetable entries

4. Help and Guidance

- In-app guide page with clear operating instructions
- Visual hints for major map elements and controls

## Tech Stack

Backend:

- Python
- FastAPI

Frontend:

- React
- Vite
- CSS

## How to Run

Open two terminals at the project root.

Backend:

    cd backend
    venv\Scripts\activate
    python -m uvicorn main:app --reload

Frontend:

    cd frontend
    npm install
    npm run dev

Then open the frontend URL shown in terminal, usually:
http://localhost:5173

## Typical User Flow

1. Open the map view.
2. Select and confirm the start block and floor.
3. Select and confirm the destination block and floor.
4. View route lines and text instructions.
5. Optionally load timetable and use smart destination.

## Notes

- The frontend and backend are developed as separate modules for easier maintenance.
- Map landmark and block definitions are managed in frontend data files.
- Timetable and routing behavior depends on backend API availability.
