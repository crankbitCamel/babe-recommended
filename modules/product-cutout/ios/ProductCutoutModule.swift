import CoreImage
import ExpoModulesCore
import UIKit
import Vision

/**
 * On-device Freisteller: nutzt Apples Vision-Framework (Subject Lifting,
 * iOS 17+), um das Produkt vom Hintergrund zu trennen — dieselbe Technik
 * wie "Motiv anheben" in der Fotos-App. Läuft komplett lokal, kostenlos.
 */
public class ProductCutoutModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ProductCutout")

    Function("isAvailable") { () -> Bool in
      if #available(iOS 17.0, *) {
        return true
      }
      return false
    }

    AsyncFunction("removeBackground") { (uriString: String) -> String? in
      guard #available(iOS 17.0, *) else { return nil }
      guard
        let url = URL(string: uriString),
        let data = try? Data(contentsOf: url),
        let uiImage = UIImage(data: data),
        let cgImage = uiImage.cgImage
      else {
        return nil
      }

      let request = VNGenerateForegroundInstanceMaskRequest()
      let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
      try handler.perform([request])

      guard let observation = request.results?.first else {
        return nil
      }

      let maskedBuffer = try observation.generateMaskedImage(
        ofInstances: observation.allInstances,
        from: handler,
        croppedToInstancesExtent: true
      )

      let ciImage = CIImage(cvPixelBuffer: maskedBuffer)
      let context = CIContext()
      guard
        let outputCG = context.createCGImage(ciImage, from: ciImage.extent),
        let pngData = UIImage(cgImage: outputCG).pngData()
      else {
        return nil
      }

      let outputURL = FileManager.default.temporaryDirectory
        .appendingPathComponent("cutout-\(UUID().uuidString).png")
      try pngData.write(to: outputURL)
      return outputURL.absoluteString
    }
  }
}
