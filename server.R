library(rjson)
library(shiny)

# Example Taken from bl.ocks.org
# http://bl.ocks.org/mbostock/1283663

# Shiny send data to client and server, by Rstudio Develeoper Winston Chang
# https://ryouready.wordpress.com/2013/11/20/sending-data-from-client-to-server-and-back-using-shiny/

# Good example of bringing shiny together with d3
# http://myinspirationinformation.com/visualisation/d3-js/integrating-d3-js-into-r-shiny/

shinyServer(
  function(input, output, session) {
   
    observeEvent(input$run,{
      data <- fromJSON(file="flare.json")
      var_json<-toJSON(data)
     
      session$sendCustomMessage(type="jsondata",var_json)
    })
    

  }
)