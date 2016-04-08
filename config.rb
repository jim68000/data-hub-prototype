###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

data.companies.each do |c|
  proxy "/companies/#{c.id}.html", "/company.html", locals: {
    company: c
  }
end

# proxy data to json files
["companies"].each do |source|
  proxy "/data/#{source}.json", "/data.json", :locals => { :source => source }, :ignore => true
end

# ignore proxy templates
ignore "company.html"
ignore "data.json"

# General configuration

set :layout, 'ukti'

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

# asset pipeline
activate :external_pipeline,
  name: :gulp,
  command: build? ? 'npm run build' : 'npm start',
  source: '.tmp/dist'

# Ignore CSS & JS as they are handled by external pipeline
ignore { |path| path =~ /(javascripts|stylesheets)\/(.*)$/ && !$2.match(/bundle\.js|\.css/) }

# Build-specific configuration
configure :build do
  activate :relative_assets

  activate :minify_css
  activate :minify_javascript

  # Ignore CSS & JS map files
  ignore '*.map'
end
