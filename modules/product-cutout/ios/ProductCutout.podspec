Pod::Spec.new do |s|
  s.name             = 'ProductCutout'
  s.version          = '1.0.0'
  s.summary          = 'On-device Freisteller via Apple Vision (Subject Lifting)'
  s.author           = 'babe recommended'
  s.homepage         = 'https://github.com/crankbitCamel/babe-recommended'
  s.license          = { :type => 'MIT' }
  s.platforms        = { :ios => '15.1' }
  s.source           = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files     = '**/*.{h,m,swift}'
end
