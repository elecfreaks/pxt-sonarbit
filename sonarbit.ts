/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */
enum Distance_Unit {
    //% block="mm" enumval=0
    Distance_Unit_mm,

    //% block="cm" enumval=1
    Distance_Unit_cm,

    //% block="inch" enumval=2
    Distance_Unit_inch,
}

enum SonarPin{
    //% block="P0" enumval=0
    SonP0 = 0,
    //% block="P1" enumval=1
    SonP1 = 1,
    //% block="P2" enumval=2
    SonP2 = 2,
    //% block="P8" enumval=8
    SonP8 = 8,
    //% block="P12" enumval=12
    SonP12 = 12,
    //% block="P13" enumval=13
    SonP13 = 13,
    //% block="P14" enumval=14
    SonP14 = 14,
    //% block="P15" enumval=15
    SonP15 = 15,

}

/**
 * Custom blocks
 */
//% color=#0fbc11 icon="\uf140"
namespace sonarbit {

    /**
    * get Ultrasonic distance
    */
    //% blockId=sonarbit block="Ultrasonic distance in unit %distance_unit |at|pin %pin"
    //% weight=10
    export function sonarbit_distance(distance_unit: Distance_Unit, snarpin: SonarPin): number {
        // send pulse
        pins.setPull(100 + snarpin, PinPullMode.PullNone)
        pins.digitalWritePin(100 + snarpin, 0)
        control.waitMicros(2)
        pins.digitalWritePin(100 + snarpin, 1)
        control.waitMicros(10)
        pins.digitalWritePin(100 + snarpin, 0)

        // read pulse
        let d = pins.pulseIn(100 + snarpin, PulseValue.High, 25000)  // 8 / 340 =
        let distance = d / 58

        if (distance > 400) {
            distance = 0
        }

        switch (distance_unit) {
            case 0:
                return Math.floor(distance * 10) //mm
                break
            case 1:
                return Math.floor(distance)  //cm
                break
            case 2:
                return Math.floor(distance / 254)   //inch
                break
            default:
                return 0
        }

    }

}
