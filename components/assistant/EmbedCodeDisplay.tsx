'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, Code } from 'lucide-react'

export function EmbedCodeDisplay() {
  const [copied, setCopied] = useState(false)

  // Mock embed code - replace with actual generated code
  const embedCode = `<!-- Cited Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.setAttribute('data-chatbot-id', 'your-chatbot-id');
    script.setAttribute('data-position', 'bottom-right');
    script.setAttribute('data-color', '#3B82F6');
    document.head.appendChild(script);
  })();
</script>
<!-- End Cited Widget -->`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Embed Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Kopieer en plak deze code in de HTML van je website, vlak voor de sluitende &lt;/body&gt; tag.
          </p>
          
          <div className="relative">
            <Textarea
              value={embedCode}
              readOnly
              className="font-mono text-xs min-h-[200px] resize-none"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Gekopieerd!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-3 w-3" />
                  Kopiëren
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installatie instructies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-indigo-500 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Kopieer de embed code</h4>
                <p className="text-sm text-gray-600">
                  Gebruik de kopieer knop hierboven om de code te kopiëren.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-indigo-500 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Plak in je website</h4>
                <p className="text-sm text-gray-600">
                  Voeg de code toe aan elke pagina waar je de chatbot wilt tonen, vlak voor &lt;/body&gt;.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-indigo-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Test de chatbot</h4>
                <p className="text-sm text-gray-600">
                  Bezoek je website om te controleren of de chatbot correct werkt.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
