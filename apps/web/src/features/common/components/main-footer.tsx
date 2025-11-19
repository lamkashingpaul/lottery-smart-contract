"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowUp } from "lucide-react";

export const MainFooter = () => {
  const currentYear = new Date().getFullYear();
  const siteAuthorName = process.env.NEXT_PUBLIC_SITE_AUTHOR_NAME;
  const siteAuthorLinkedInUrl = `${process.env.NEXT_PUBLIC_SITE_AUTHOR_LINKEDIN_URL}`;
  const siteGithubUrl = `${process.env.NEXT_PUBLIC_SITE_AUTHOR_GITHUB_URL}/lottery-smart-contract`;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center lg:flex-row-reverse lg:justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>

          <div className="text-balance text-center text-muted-foreground text-sm leading-loose md:text-left">
            {`© ${currentYear} `}
            <a
              href={siteAuthorLinkedInUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 transition-colors hover:text-primary"
            >
              {siteAuthorName}
            </a>
            {
              ". Built with smart contracts for decentralized lottery gaming. Source code available on "
            }
            <a
              href={siteGithubUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 transition-colors hover:text-primary"
            >
              GitHub
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  );
};
