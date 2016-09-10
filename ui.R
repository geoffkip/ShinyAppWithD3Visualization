library(shiny)



shinyUI(fluidPage(
  title = "d3 Shiny",
  
  tags$head(
    tags$link(rel = "stylesheet", type = "text/css", href = "style.css"),
    tags$script(src="https://d3js.org/d3.v3.min.js", charset="utf-8")
    
  ),

  fluidRow(column(1,offset=1,actionButton("run",label='Chart!'))),
  
  HTML('<div class="chart"></div>'),
  tags$script(src="barchart.js")
  

))
  