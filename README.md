# ZenUX Application

Welcome to the ZenUX project! This application is designed to help you search and manage tickets effortlessly.

## Getting Started (macOS)

To run this project on your Mac, you'll need to follow these simple steps.

### 1. Prerequisites
Make sure you have **Docker Desktop** installed and running.
- [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)

### 2. Make the scripts runnable
Before running the app for the first time, you need to give your Mac permission to execute the start and stop scripts.

1. Open the **Terminal** app (found in Applications > Utilities).
2. Type `cd` followed by a space, then drag the project folder into the Terminal window and press **Enter**.
3. Copy and paste the following command and press **Enter**:

```bash
chmod +x start_app.sh stop_app.sh
```

### 3. Start the Application
To launch everything, simply double-click the `start_app.sh` file or run it from the terminal:
```bash
./start_app.sh
```

Once it finishes building, you can access the app at:
- **Web UI:** [http://localhost:5174](http://localhost:5174)
- **Backend API:** [http://localhost:8085](http://localhost:8085)

### 4. Stop the Application
When you're done, double-click `stop_app.sh` or run:
```bash
./stop_app.sh
```

---

## Project Structure
- `frontend/`: All the user interface code.
- `backend/`: The logic and API connections.
- `.env`: Your configuration and credentials.
