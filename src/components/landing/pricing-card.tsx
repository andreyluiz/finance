import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  className?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  popular = false,
  ctaText,
  ctaHref,
  className,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative transition-all duration-300 hover:shadow-2xl",
        popular &&
          "border-primary shadow-xl scale-105 hover:scale-110 ring-2 ring-primary/20",
        !popular && "hover:scale-105",
        className,
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground shadow-lg px-4 py-1 text-sm font-semibold">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <div className="mt-4 mb-2">
          <span className="text-5xl font-bold text-foreground">{price}</span>
          {price !== "Free" && (
            <span className="text-muted-foreground ml-2">/{period}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3 mb-6">
          {features.map((feature) => (
            <li key={feature.text} className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex-shrink-0 rounded-full p-1",
                  feature.included
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {feature.included ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  feature.included
                    ? "text-foreground"
                    : "text-muted-foreground line-through",
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <Button
          asChild
          className="w-full"
          size="lg"
          variant={popular ? "default" : "outline"}
        >
          <a href={ctaHref}>{ctaText}</a>
        </Button>
      </CardContent>
    </Card>
  );
}
