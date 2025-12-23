/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */

// External imports
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Internal imports
import Page from "../app/(public)/page";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

// Mock i18n instance
vi.mock("@/lib/i18n/i18n", () => ({
  default: {
    language: "en",
    changeLanguage: vi.fn(),
  },
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ fill, priority, ...props }: any) => {
    return <img {...props} data-fill={fill} data-priority={priority} />;
  },
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock internal components that might cause issues in jsdom
vi.mock("@/components/common/CustomCursor", () => ({
  default: () => <div data-testid="custom-cursor" />,
}));

vi.mock("@/components/features/home/TutorialCarousel", () => ({
  default: () => <div data-testid="tutorial-carousel" />,
}));

describe("Home Page", () => {
  it("renders correctly", () => {
    render(<Page />);

    // Check if main title key is present (since we mocked t to return the key)
    expect(screen.getByText("home.title")).toBeInTheDocument();
    expect(screen.getByText("home.subtitle")).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByText("home.joinUs")).toBeInTheDocument();
    expect(screen.getByText("home.downloadApp")).toBeInTheDocument();
  });
});
