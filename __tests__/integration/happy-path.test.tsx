import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FocusTimerPage from "@/app/(main)/focus-timer/page";
import * as apiClient from "@/lib/api-client";

jest.mock("@/components/AudioProvider", () => ({
  useAudio: () => ({
    activeAmbientSounds: [],
    toggleAmbientSound: jest.fn(),
    ambientVolume: 0.5,
    setAmbientVolume: jest.fn(),
    musicTrackId: "jfKfPfyJRdk",
    setMusicTrackId: jest.fn(),
    musicPlaying: false,
    setMusicPlaying: jest.fn(),
    stopAllSounds: jest.fn(),
  }),
}));

jest.mock("@/lib/api-client", () => ({
  profileApi: { get: jest.fn() },
  tasksApi: { list: jest.fn() },
  sessionsApi: { list: jest.fn(), create: jest.fn() },
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_, callback) => {
    callback({
      uid: "user-1",
      displayName: "Test User",
      email: "test@example.com",
      photoURL: null,
    });
    return jest.fn();
  }),
}));

describe("Phase 9 happy path smoke test", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    (apiClient.profileApi.get as jest.Mock).mockResolvedValue({
      profilePhotoUrl: null,
    });
    (apiClient.tasksApi.list as jest.Mock).mockResolvedValue([
      {
        id: "task-1",
        title: "Write the paper",
        description: "",
        status: "pending",
        priority: "high",
        category: "School",
        course: "WADS",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    ]);
    (apiClient.sessionsApi.list as jest.Mock).mockResolvedValue([]);
    (apiClient.sessionsApi.create as jest.Mock).mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      taskId: null,
      durationMinutes: 25,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      notes: "",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("completes a focus session and saves it", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<FocusTimerPage />);

    await waitFor(() => expect(screen.getByText("Focus Timer")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /start/i }));

    await act(async () => {
      jest.advanceTimersByTime(25 * 60 * 1000 + 1000);
    });

    await waitFor(() => {
      expect(apiClient.sessionsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          durationMinutes: 25,
        })
      );
    });
  });
});