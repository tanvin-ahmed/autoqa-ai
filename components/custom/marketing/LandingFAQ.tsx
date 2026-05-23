"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { landingFaqItems } from "@/lib/marketing/faq-content";

export function LandingFAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative border-y border-border/80 bg-muted/25 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2
          id="faq-heading"
          className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Frequently asked questions
        </h2>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
          Practical answers teams ask before plugging Auto QA into an existing codebase.
        </p>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {landingFaqItems.map((item, idx) => (
            <AccordionItem key={item.question} value={`item-${idx}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
