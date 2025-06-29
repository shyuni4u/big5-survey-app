import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { aboutContent } from '@/lib/data'

export default function AboutSection() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-foreground">Big5 모델에 대해</CardTitle>
        <CardDescription className="text-muted-foreground">성격 분석의 과학적 배경을 알아보세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {aboutContent.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="pt-2 leading-relaxed text-muted-foreground">{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
