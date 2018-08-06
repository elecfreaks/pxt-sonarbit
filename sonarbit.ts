
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


/**
 * Custom blocks
 */
//% weight=10 color=#0fbc11 icon="\uf140"
namespace sonarbit {

    /**
    * get Ultrasonic distance
    */
    //% blockId=sonarbit block="Ultrasonic distance in unit %distance_unit |at|pin %pin"
    //% weight=10
    export function sonarbit_distance(distance_unit: Distance_Unit, pin: DigitalPin): number {

        // send pulse
        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(pin, 0);

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 23000);  // 8 / 340 = 
        let distance = d * 10 * 5 / 3 / 58;


        switch (distance_unit) {
            case 0:
                return distance //mm
                break;
            case 1:
                return distance / 10  //cm
                break;
            case 2:
                return distance / 25  //inch
                break;
            default:
                return 0

        }

    }

}
